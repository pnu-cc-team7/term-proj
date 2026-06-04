import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { SketchButton } from '../common';
import {
  loadKakaoMapsSdk,
  type KakaoMapInstance,
  type KakaoMaps,
  type KakaoMarkerInstance,
  type KakaoPlaceSearchPagination,
  type KakaoPlaceSearchResult,
} from '../../lib/kakaoMapLoader';
import './MapPlacePicker.css';

export interface VoteOptionDraft {
  name: string;
  lat: number;
  lng: number;
  kakao_id: string;
}

interface LocationPoint {
  lat: number;
  lng: number;
  label: string;
}

interface PlaceCandidate {
  id: string;
  name: string;
  address: string;
  category?: string;
  distance?: string;
  phone?: string;
  placeUrl?: string;
  lat: number;
  lng: number;
}

interface MapPlacePickerProps {
  options: VoteOptionDraft[];
  onAddOption: (option: VoteOptionDraft) => void;
  onRemoveOption: (kakaoId: string) => void;
}

type GeoStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'fallback'
  | 'unsupported';

type SearchStatus = 'idle' | 'loading' | 'ready' | 'empty' | 'error';
type SdkStatus = 'loading' | 'ready' | 'error';

const DEFAULT_KEYWORD = '음식점';
const DEFAULT_LOCATION: LocationPoint = {
  lat: 35.2338,
  lng: 129.0799,
  label: 'Pusan National University',
};
const RADIUS_OPTIONS = [
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
];

const markerSvg = (fill: string, stroke: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 42S3 28.8 3 16.8C3 8.8 9.3 2.5 17 2.5s14 6.3 14 14.3C31 28.8 17 42 17 42Z" fill="${fill}" stroke="${stroke}" stroke-width="3"/><circle cx="17" cy="16.8" r="5.2" fill="${stroke}"/></svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const createMarkerImage = (
  maps: KakaoMaps,
  variant: 'current' | 'default' | 'selected' | 'added',
) => {
  const colors = {
    current: { fill: '#f9d27c', stroke: '#2b2620' },
    default: { fill: '#fbf6ec', stroke: '#2b2620' },
    selected: { fill: '#d8482b', stroke: '#2b2620' },
    added: { fill: '#78b892', stroke: '#2b2620' },
  };
  const color = colors[variant];

  return new maps.MarkerImage(
    markerSvg(color.fill, color.stroke),
    new maps.Size(34, 44),
    { offset: new maps.Point(17, 42) },
  );
};

const normalizePlace = (
  place: KakaoPlaceSearchResult,
): PlaceCandidate | null => {
  const lat = Number(place.y);
  const lng = Number(place.x);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    id: place.id,
    name: place.place_name,
    address: place.road_address_name || place.address_name,
    category: place.category_name,
    distance: place.distance,
    phone: place.phone?.trim() || undefined,
    placeUrl: place.place_url,
    lat,
    lng,
  };
};

const formatDistance = (distance?: string) => {
  const meters = Number(distance);

  if (!Number.isFinite(meters)) return '';
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;

  return `${Math.round(meters)} m`;
};

const compactCategory = (category?: string) =>
  category
    ?.split('>')
    .map((item) => item.trim())
    .filter(Boolean)
    .at(-1) || '';

const categoryPath = (category?: string) =>
  category
    ?.split('>')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(' / ') || '';

const requestNextSearchPage = (pagination?: KakaoPlaceSearchPagination) => {
  if (!pagination?.hasNextPage) return false;

  if (typeof pagination.nextPage === 'function') {
    pagination.nextPage();
    return true;
  }

  if (
    typeof pagination.gotoPage === 'function' &&
    typeof pagination.current === 'number'
  ) {
    pagination.gotoPage(pagination.current + 1);
    return true;
  }

  return false;
};

export const MapPlacePicker: React.FC<MapPlacePickerProps> = ({
  options,
  onAddOption,
  onRemoveOption,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<KakaoMapInstance | null>(null);
  const userMarkerRef = useRef<KakaoMarkerInstance | null>(null);
  const placeMarkersRef = useRef<KakaoMarkerInstance[]>([]);
  const searchRequestRef = useRef(0);

  const [maps, setMaps] = useState<KakaoMaps | null>(null);
  const [sdkStatus, setSdkStatus] = useState<SdkStatus>('loading');
  const [sdkMessage, setSdkMessage] = useState('Loading Kakao Maps...');
  const [geoStatus, setGeoStatus] = useState<GeoStatus>('idle');
  const [geoMessage, setGeoMessage] = useState(
    'Allow location access to find nearby restaurants, or search around PNU.',
  );
  const [center, setCenter] = useState<LocationPoint>(DEFAULT_LOCATION);
  const [keyword, setKeyword] = useState(DEFAULT_KEYWORD);
  const [radius, setRadius] = useState(1000);
  const [places, setPlaces] = useState<PlaceCandidate[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle');
  const [searchMessage, setSearchMessage] = useState(
    'Choose a search base and look for restaurants nearby.',
  );

  const addedOptionIds = useMemo(
    () => new Set(options.map((option) => option.kakao_id)),
    [options],
  );
  const selectedPlace =
    places.find((place) => place.id === selectedPlaceId) || null;

  useEffect(() => {
    let isMounted = true;

    const loadSdk = async () => {
      setSdkStatus('loading');
      const result = await loadKakaoMapsSdk();

      if (!isMounted) return;

      if (result.ok) {
        setMaps(result.maps);
        setSdkStatus('ready');
        setSdkMessage('Map is ready.');
        return;
      }

      setSdkStatus('error');
      setSdkMessage(result.error.message);
    };

    loadSdk();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!maps || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = new maps.Map(mapContainerRef.current, {
      center: new maps.LatLng(center.lat, center.lng),
      level: 5,
    });
  }, [center.lat, center.lng, maps]);

  useEffect(() => {
    if (!maps || !mapRef.current) return;

    const map = mapRef.current;
    const currentPosition = new maps.LatLng(center.lat, center.lng);

    userMarkerRef.current?.setMap(null);
    placeMarkersRef.current.forEach((marker) => marker.setMap(null));
    placeMarkersRef.current = [];

    const userMarker = new maps.Marker({
      position: currentPosition,
      image: createMarkerImage(maps, 'current'),
    });
    userMarker.setMap(map);
    userMarkerRef.current = userMarker;

    const bounds = new maps.LatLngBounds();
    bounds.extend(currentPosition);

    placeMarkersRef.current = places.map((place) => {
      const position = new maps.LatLng(place.lat, place.lng);
      const marker = new maps.Marker({
        position,
        image: createMarkerImage(
          maps,
          addedOptionIds.has(place.id)
            ? 'added'
            : selectedPlaceId === place.id
              ? 'selected'
              : 'default',
        ),
      });

      marker.setMap(map);
      maps.event.addListener(marker, 'click', () => {
        setSelectedPlaceId(place.id);
        map.setCenter(position);
      });
      bounds.extend(position);

      return marker;
    });

    if (places.length > 0) {
      map.setBounds(bounds);
    } else {
      map.setCenter(currentPosition);
      map.setLevel(radius === 500 ? 4 : radius === 1000 ? 5 : 6);
    }

    return () => {
      userMarkerRef.current?.setMap(null);
      userMarkerRef.current = null;
      placeMarkersRef.current.forEach((marker) => marker.setMap(null));
      placeMarkersRef.current = [];
    };
  }, [
    addedOptionIds,
    center.lat,
    center.lng,
    maps,
    places,
    radius,
    selectedPlaceId,
  ]);

  const runSearch = useCallback(
    (searchCenter: LocationPoint = center) => {
      if (!maps) {
        setSearchStatus('error');
        setSearchMessage(sdkMessage);
        return;
      }

      const searchTerm = keyword.trim() || DEFAULT_KEYWORD;
      const placesService = new maps.services.Places();
      const requestId = searchRequestRef.current + 1;
      let mergedPlaces: PlaceCandidate[] = [];

      searchRequestRef.current = requestId;

      setSearchStatus('loading');
      setSearchMessage(
        `Searching for "${searchTerm}" within ${radius.toLocaleString()} m of ${searchCenter.label}.`,
      );

      placesService.keywordSearch(
        searchTerm,
        (data, status, pagination) => {
          if (searchRequestRef.current !== requestId) return;

          if (status === maps.services.Status.OK) {
            const pagePlaces = data
              .map(normalizePlace)
              .filter((place): place is PlaceCandidate => Boolean(place));
            const knownPlaceIds = new Set(mergedPlaces.map((place) => place.id));

            mergedPlaces = [
              ...mergedPlaces,
              ...pagePlaces.filter((place) => !knownPlaceIds.has(place.id)),
            ];

            setPlaces(mergedPlaces);
            setSelectedPlaceId((currentSelectedPlaceId) =>
              currentSelectedPlaceId && mergedPlaces.some((place) => place.id === currentSelectedPlaceId)
                ? currentSelectedPlaceId
                : mergedPlaces[0]?.id || null,
            );

            if (requestNextSearchPage(pagination)) {
              setSearchMessage(
                `Loaded ${mergedPlaces.length} places near ${searchCenter.label}. Loading more...`,
              );
              return;
            }

            setSearchStatus(mergedPlaces.length > 0 ? 'ready' : 'empty');
            setSearchMessage(
              mergedPlaces.length > 0
                ? `${mergedPlaces.length} places found near ${searchCenter.label}.`
                : `No places found near ${searchCenter.label}. Try a broader radius or keyword.`,
            );
            return;
          }

          setPlaces([]);
          setSelectedPlaceId(null);
          setSearchStatus(status === maps.services.Status.ZERO_RESULT ? 'empty' : 'error');
          setSearchMessage(
            status === maps.services.Status.ZERO_RESULT
              ? 'No places found. Try a broader radius or another keyword.'
              : 'Place search failed. Please try again.',
          );
        },
        {
          location: new maps.LatLng(searchCenter.lat, searchCenter.lng),
          radius,
        },
      );
    },
    [center, keyword, maps, radius, sdkMessage],
  );

  const selectFallbackLocation = useCallback(
    (shouldSearch: boolean) => {
      setCenter(DEFAULT_LOCATION);
      setGeoStatus('fallback');
      setGeoMessage('Using Pusan National University as the search base.');

      if (shouldSearch) {
        runSearch(DEFAULT_LOCATION);
      }
    },
    [runSearch],
  );

  const requestCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      setGeoMessage(
        'This browser does not support geolocation. You can still search around PNU.',
      );
      setCenter(DEFAULT_LOCATION);
      return;
    }

    setGeoStatus('requesting');
    setGeoMessage('Waiting for browser location permission...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCenter: LocationPoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'your current location',
        };

        setCenter(nextCenter);
        setGeoStatus('granted');
        setGeoMessage('Using your current location as the search base.');
        runSearch(nextCenter);
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;

        setCenter(DEFAULT_LOCATION);
        setGeoStatus(denied ? 'denied' : 'fallback');
        setGeoMessage(
          denied
            ? 'Location permission was denied. Manual search still works around PNU.'
            : 'Could not detect your location. Falling back to PNU.',
        );

        if (!denied) {
          runSearch(DEFAULT_LOCATION);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 60000,
      },
    );
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    runSearch(center);
  };

  const handleAddPlace = (place: PlaceCandidate) => {
    if (addedOptionIds.has(place.id)) return;

    onAddOption({
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      kakao_id: place.id,
    });
  };

  return (
    <section className="map-picker" aria-label="Map based place picker">
      <div className="map-picker-toolbar">
        <div>
          <h3>Pick Restaurants On The Map</h3>
          <p>{geoMessage}</p>
        </div>
        <div className="map-picker-actions">
          <SketchButton
            type="button"
            onClick={requestCurrentLocation}
            disabled={sdkStatus !== 'ready' || geoStatus === 'requesting'}
          >
            {geoStatus === 'requesting' ? 'Locating...' : 'Use My Location'}
          </SketchButton>
          <SketchButton
            type="button"
            onClick={() => selectFallbackLocation(true)}
            disabled={sdkStatus !== 'ready'}
          >
            Search Near PNU
          </SketchButton>
        </div>
      </div>

      <form className="map-picker-search" onSubmit={handleSearchSubmit}>
        <input
          className="sketch-input"
          placeholder="Search restaurants, noodles, pizza..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <div className="radius-group" aria-label="Search radius">
          {RADIUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={radius === option.value ? 'active' : ''}
              onClick={() => setRadius(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <SketchButton
          type="submit"
          variant="primary"
          disabled={sdkStatus !== 'ready' || searchStatus === 'loading'}
        >
          {searchStatus === 'loading' ? 'Searching...' : 'Search'}
        </SketchButton>
      </form>

      <div className="map-picker-grid">
        <div className="map-pane">
          <div ref={mapContainerRef} className="kakao-map-canvas">
            {sdkStatus === 'loading' && (
              <p className="map-overlay-text">Loading map...</p>
            )}
            {sdkStatus === 'error' && (
              <div className="map-overlay-text">
                <strong>Map unavailable</strong>
                <span>{sdkMessage}</span>
              </div>
            )}
          </div>
          <div className="map-legend" aria-label="Map marker legend">
            <span>
              <i className="legend-current" /> Current base
            </span>
            <span>
              <i className="legend-place" /> Result
            </span>
            <span>
              <i className="legend-selected" /> Selected
            </span>
            <span>
              <i className="legend-added" /> Added
            </span>
          </div>
        </div>

        <aside className="place-list-pane">
          <div className={`status-line ${searchStatus}`}>
            {searchMessage}
          </div>

          {searchStatus === 'idle' && (
            <div className="empty-state">
              Start with your current location or PNU, then search nearby
              restaurants.
            </div>
          )}

          {searchStatus === 'empty' && (
            <div className="empty-state">
              No restaurants found for this search. Try 2 km or another keyword.
            </div>
          )}

          <div className="place-results">
            {places.map((place) => {
              const isSelected = selectedPlaceId === place.id;
              const isAdded = addedOptionIds.has(place.id);
              const distance = formatDistance(place.distance);
              const category = compactCategory(place.category);
              const fullCategory = categoryPath(place.category);

              return (
                <article
                  key={place.id}
                  className={`place-result ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedPlaceId(place.id)}
                >
                  <div className="place-result-main">
                    <h4>{place.name}</h4>
                    <p>{place.address || 'Address unavailable'}</p>
                    {fullCategory && (
                      <p className="place-category-path">{fullCategory}</p>
                    )}
                    {(category || distance || place.phone || place.placeUrl) && (
                      <div className="place-meta">
                        {category && <span>{category}</span>}
                        {distance && <span>{distance}</span>}
                        {place.phone && <span>{place.phone}</span>}
                        {place.placeUrl && (
                          <a
                            href={place.placeUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                          >
                            Details
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <SketchButton
                    type="button"
                    variant={isAdded ? 'default' : 'primary'}
                    disabled={isAdded}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleAddPlace(place);
                    }}
                  >
                    {isAdded ? 'Added' : 'Add'}
                  </SketchButton>
                </article>
              );
            })}
          </div>
        </aside>
      </div>

      {selectedPlace && (
        <div className="selected-place-strip">
          <strong>{selectedPlace.name}</strong>
          <span>{selectedPlace.address}</span>
          <SketchButton
            type="button"
            variant={addedOptionIds.has(selectedPlace.id) ? 'default' : 'primary'}
            disabled={addedOptionIds.has(selectedPlace.id)}
            onClick={() => handleAddPlace(selectedPlace)}
          >
            {addedOptionIds.has(selectedPlace.id) ? 'Already Added' : 'Add Candidate'}
          </SketchButton>
        </div>
      )}

      <div className="candidate-basket">
        <div className="basket-head">
          <h3>Selected Candidates</h3>
          <span>{options.length} / minimum 2</span>
        </div>

        {options.length === 0 ? (
          <div className="empty-state">
            Add at least two restaurants from the map or list.
          </div>
        ) : (
          <div className="candidate-list">
            {options.map((option) => (
              <div className="candidate-chip" key={option.kakao_id}>
                <span>{option.name}</span>
                <button
                  type="button"
                  aria-label={`Remove ${option.name}`}
                  onClick={() => onRemoveOption(option.kakao_id)}
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

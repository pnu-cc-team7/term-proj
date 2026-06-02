# VoteApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**votesGet**](#votesget) | **GET** /votes | 전체 투표 목록 조회|
|[**votesIdParticipatePost**](#votesidparticipatepost) | **POST** /votes/{id}/participate | 특정 투표에 참여 (인증 필요)|
|[**votesIdResultsGet**](#votesidresultsget) | **GET** /votes/{id}/results | 투표 결과(단순 득표수) 조회|
|[**votesPost**](#votespost) | **POST** /votes | 신규 투표 생성 (인증 필요)|

# **votesGet**
> Array<Vote> votesGet()


### Example

```typescript
import {
    VoteApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VoteApi(configuration);

const { status, data } = await apiInstance.votesGet();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**Array<Vote>**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **votesIdParticipatePost**
> votesIdParticipatePost(votesIdParticipatePostRequest)


### Example

```typescript
import {
    VoteApi,
    Configuration,
    VotesIdParticipatePostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new VoteApi(configuration);

let id: string; // (default to undefined)
let votesIdParticipatePostRequest: VotesIdParticipatePostRequest; //

const { status, data } = await apiInstance.votesIdParticipatePost(
    id,
    votesIdParticipatePostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **votesIdParticipatePostRequest** | **VotesIdParticipatePostRequest**|  | |
| **id** | [**string**] |  | defaults to undefined|


### Return type

void (empty response body)

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 참여 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **votesIdResultsGet**
> VotesIdResultsGet200Response votesIdResultsGet()


### Example

```typescript
import {
    VoteApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new VoteApi(configuration);

let id: string; // (default to undefined)

const { status, data } = await apiInstance.votesIdResultsGet(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**string**] |  | defaults to undefined|


### Return type

**VotesIdResultsGet200Response**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: application/json


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **votesPost**
> votesPost(voteCreate)


### Example

```typescript
import {
    VoteApi,
    Configuration,
    VoteCreate
} from './api';

const configuration = new Configuration();
const apiInstance = new VoteApi(configuration);

let voteCreate: VoteCreate; //

const { status, data } = await apiInstance.votesPost(
    voteCreate
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **voteCreate** | **VoteCreate**|  | |


### Return type

void (empty response body)

### Authorization

[bearerAuth](../README.md#bearerAuth)

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: Not defined


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**201** | 생성 성공 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


# IdentificationApi

All URIs are relative to *http://localhost*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**authKakaoPost**](#authkakaopost) | **POST** /auth/kakao | 카카오 토큰으로 서비스 로그인|

# **authKakaoPost**
> authKakaoPost(authKakaoPostRequest)


### Example

```typescript
import {
    IdentificationApi,
    Configuration,
    AuthKakaoPostRequest
} from './api';

const configuration = new Configuration();
const apiInstance = new IdentificationApi(configuration);

let authKakaoPostRequest: AuthKakaoPostRequest; //

const { status, data } = await apiInstance.authKakaoPost(
    authKakaoPostRequest
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **authKakaoPostRequest** | **AuthKakaoPostRequest**|  | |


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
|**200** | 성공 (Http-Only Cookie 발급) |  * Set-Cookie -  <br>  |
|**401** | 유효하지 않은 토큰 |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


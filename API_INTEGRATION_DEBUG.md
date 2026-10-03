# Authentication & API Integration Debugging Guide

## Issues Identified & Fixes Applied

### 1. **CORS Error with Wildcard (*) and credentials**
**Error**: `Access-Control-Allow-Origin header in the response must not be the wildcard '*' when the request's credentials mode is 'include'`

**Root Cause**: The browser doesn't allow wildcard CORS with credentials. You were sending `credentials: 'include'` but backend CORS policy wasn't configured for specific origins.

**Solution Applied**: 
- Created a centralized API utility (`src/lib/api.ts`)
- Sends token via `Authorization: Bearer <token>` header instead of relying on cookies
- Removed `credentials: 'include'` from categoriesSlice

### 2. **401 Unauthorized Error**
**Error**: `GET/POST https://api.brundhavanamdesifoods.com/... net::ERR_FAILED 401 (Unauthorized)`

**Root Cause**: API calls weren't including the authentication token stored from login

**Solution Applied**:
- Updated `categoriesSlice.ts` to use `apiCall()` utility which automatically adds `Authorization: Bearer <token>`
- Token is retrieved from `localStorage.getItem('authToken')`
- All API requests now include the token in headers

---

## How the Flow Works Now

### Login Flow (Already Implemented)
1. ✅ User submits credentials to `POST /user/login`
2. ✅ Response includes `token` (JWT)
3. ✅ Token stored in `localStorage` via Redux slice
4. ✅ User redirected to dashboard

### API Call Flow (Fixed)
1. ✅ Component dispatches async action (e.g., `fetchCategories()`)
2. ✅ `createAsyncThunk` calls `apiCall()` utility
3. ✅ `apiCall()` retrieves token from localStorage
4. ✅ Token added to request header: `Authorization: Bearer <token>`
5. ✅ Backend validates token and processes request
6. ✅ Response handled, state updated

---

## Verification Steps

### 1. **Check Token Storage**
Open browser DevTools → Application → Local Storage
- Should see `authToken` key with your JWT token value
- If missing, login didn't work

### 2. **Check API Requests**
Open browser DevTools → Network tab
- Select any API request (e.g., GET /categories)
- Go to "Request Headers" tab
- **Should see**: `Authorization: Bearer eyJhbGc...`

### 3. **Check Console Logs**
Browser Console should show:
```
[API] GET https://api.brundhavanamdesifoods.com/categories {
  hasToken: true,
  headers: { Authorization: *** }
}
```

### 4. **Test in Postman**
To verify backend is working:
1. Login: `POST https://api.brundhavanamdesifoods.com/user/login`
   - Body: `{"EMAIL":"...","PASSWORD":"..."}`
   - Copy token from response
2. Get Categories: `GET https://api.brundhavanamdesifoods.com/categories`
   - Header: `Authorization: Bearer <token>`
   - Should return category list

---

## Common Issues & Solutions

### Issue: Still Getting 401 Unauthorized
**Check**:
1. Is token in localStorage? 
   - DevTools → Application → Local Storage → authToken
2. Is login actually successful?
   - Check Redux state in Redux DevTools
   - Verify you see `isAuthenticated: true`
3. Is token being sent with request?
   - Check Network tab → Request Headers → Authorization

### Issue: CORS Still Blocking
**Solution**: Ask backend team to:
1. Update CORS policy to accept requests from `http://localhost:8081` (or your dev URL)
2. Set specific origin instead of wildcard: `Access-Control-Allow-Origin: http://localhost:8081`
3. Allow credentials header: `Access-Control-Allow-Credentials: true`
4. Example CORS config:
   ```
   Access-Control-Allow-Origin: http://localhost:8081
   Access-Control-Allow-Credentials: true
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization
   ```

### Issue: Token Expires & Need Refresh
**Future Enhancement** (not implemented yet):
- Add token refresh logic in `api.ts`
- Intercept 401 responses
- Call refresh endpoint
- Retry original request

---

## Files Changed

1. **`src/lib/api.ts`** (NEW)
   - Centralized API utility with auth headers
   - Automatic token injection
   - Logging for debugging

2. **`src/store/slices/categoriesSlice.ts`**
   - Imported `apiCall` and `handleApiError`
   - Updated all fetch calls to use utility
   - Proper error handling

3. **`src/store/slices/authSlice.ts`** (Previously)
   - Stores token in localStorage
   - Token persists across refreshes

4. **`src/pages/Login.tsx`** (Previously)
   - Calls login API
   - Stores response data in Redux

---

## Next Steps

1. ✅ Login with your credentials
2. ✅ Check token in localStorage
3. ✅ Check Network tab for Authorization header
4. ✅ Categories should fetch successfully
5. ✅ Create categories should work

If still getting 401: **Backend CORS policy likely needs updating**

Ask backend team to check their CORS configuration!

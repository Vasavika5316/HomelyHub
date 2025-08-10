import {createSlice} from '@reduxjs/toolkit';

const userSlice = createSlice({
    name:'user',
    initialState:{
        isAuthenticated:false,
        loading:false,
        user:null,
        errors:null,
        success:false,
    },
    reducers:{
        getSignUpRequest(state) {
            state.loading=true;
        },
        getSignUpDetails(state, action) {
            state.user = action.payload;
            state.isAuthenticated=true;
            state.loading=false;
        },
        getLoginRequest(state){
            state.loading=true;
        },
        getLoginDetails(state, action) {
            state.user = action.payload;
            state.isAuthenticated=true;
            state.loading=false;
        },
        getError(state, action) {
            state.errors=action.payload;
            state.loading=false;
        },
        getCurrentUserRequest(state) {
            state.loading=true;
        },
        getUpdateUserRequest(state, action) {
            state.loading=true;
        },
        getCurrentUser(state, action) {
            if (action.payload) {
                state.user = action.payload;
                state.isAuthenticated = true;
            } else {
                state.user = null;
                state.isAuthenticated = false;
            }
            state.loading=false;
        },
        getLogOutRequest(state) {
            state.loading=true;
        },
        getLogout(state, action) {
            state.user=null;
            state.isAuthenticated=false;
            state.loading=false;
        },
        getPasswordRequest(state) {
            state.loading=true;
        },
        getPasswordSuccess(state, action) {
            state.success=action.payload;
            state.loading=false;
        },
        clearError(state) {
            state.errors=null;
        }
    }
})
export const userActions = userSlice.actions;
export default userSlice;
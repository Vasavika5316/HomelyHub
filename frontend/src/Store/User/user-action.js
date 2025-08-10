import api from "../../utils/axios";
import { userActions } from "./user-slice";

export const getSignUp = (user) => async(dispatch) => {
    try{
        dispatch(userActions.getSignUpRequest());
        const {data} = await api.post("/api/v1/rent/user/signup", user);
        // Store token in localStorage for persistence
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        dispatch(userActions.getSignUpDetails(data.user))
    } catch (error) {
        dispatch(userActions.getError(error.response?.data?.message || 'Signup failed'))
    }
}

export const getLogIn = (user) => async(dispatch) => {
    try{
        dispatch(userActions.getLoginRequest());
        const {data} = await api.post("/api/v1/rent/user/login", user);
        // Store token in localStorage for persistence
        if (data.token) {
            localStorage.setItem('token', data.token);
        }
        dispatch(userActions.getLoginDetails(data.user));
    } catch(error) {
        dispatch(userActions.getError(error.response?.data?.message || 'Login failed'))
    }
}

export const currentUser = () => async(dispatch) => {
    try{
        dispatch(userActions.getCurrentUserRequest());
        const {data} = await api.get("/api/v1/rent/user/me");
        dispatch(userActions.getCurrentUser(data.data.user));
    } catch(error) {
        // Don't show error for auth check, just set as not authenticated
        dispatch(userActions.getCurrentUser(null));
    }
}

export const updateUser = (update) => async(dispatch) => {
    try{
        dispatch(userActions.getUpdateUserRequest());
        await api.patch("/api/v1/rent/user/updateMe", update);
        const {data} = await api.get("/api/v1/rent/user/me");
        dispatch(userActions.getCurrentUser(data.data.user));
    } catch(error) {
        dispatch(userActions.getError(error.response?.data?.message || 'Update failed'))
    }
}

export const forgotPassword = (email) => async(dispatch) => {
    try{
        await api.post("/api/v1/rent/user/forgotPassword", {email})
    } catch(error) {
        dispatch(userActions.getError(error.response?.data?.message || 'Password reset failed'))
    }
}

export const resetPassword = (repassword, token) => async(dispatch) => {
    try{
        await api.patch(`/api/v1/rent/user/resetPassword/${token}`, repassword)
    } catch(error) {
        dispatch(userActions.getError(error.response?.data?.message || 'Password reset failed'))
    }
}

export const updatePassword = (passwords) => async(dispatch) => {
    try{
        dispatch(userActions.getPasswordRequest())
        await api.patch("/api/v1/rent/user/updateMyPassword", passwords)
        dispatch(userActions.getPasswordSuccess(true))
    } catch(error) {
        dispatch(userActions.getError(error.response?.data?.message || 'Password update failed'))
    }
}

export const Logout = () => async(dispatch) => {
    try{
        await api.get("/api/v1/rent/user/logout")
        // Clear token from localStorage
        localStorage.removeItem('token');
        dispatch(userActions.getLogout(null))
    } catch(error) {
        // Even if logout fails, clear local state
        localStorage.removeItem('token');
        dispatch(userActions.getLogout(null))
    }
}

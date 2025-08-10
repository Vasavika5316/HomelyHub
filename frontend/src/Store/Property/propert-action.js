import api from "../../utils/axios";
import {propertyAction} from "./property-slice";

export const getAllProperties = () => async(dispatch, getState) => {
    try{
        dispatch(propertyAction.getRequest())
        const {searchParams} = getState().properties;
        console.log('Search params being sent:', searchParams); // Debug log
        const response = await api.get(`/api/v1/rent/listing`, {
            params:{...searchParams},
        })
        if (!response) {
            throw new Error("Could not fetch any properties");
        }
        const {data} = response;
        console.log('Response received:', data); // Debug log
        dispatch(propertyAction.getProperties(data));
    } catch(error) {
        console.error('Error fetching properties:', error); // Debug log
        dispatch(propertyAction.getErrors(error.message));
    }
}
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'react-toastify';

const INITIAL_STATE = {
    user:null,
    loading:false
}

// Sign up function - create a new user
export const signup = createAsyncThunk(
    "user/createUser",
    async (values, thunkAPI) => {
        thunkAPI.dispatch(setLoading(true));
        try{
            const {data} = await axios.post('', ...values);
            if(data.success){
                toast.info("Account created! Login.");
            } else {
                toast.error(data.message);
            }
        } catch (e){
            toast.error("Failed to register! Try again.");
        }
        thunkAPI.dispatch(setLoading(false));
    }
)

// Sign In
export const signin = createAsyncThunk(
    "user/login",
    async (formData, thunkAPI) => {
        try{
            thunkAPI.dispatch(setLoading(true));
            const {data} = await axios.post(`http://localhost:3200/users/login`, {
                email:formData.email, password:formData.password
            });
            if(data.success){
                const user = data.data;
                thunkAPI.dispatch(setUser(user));
                localStorage.setItem('user', JSON.stringify(user));
                toast.success("Signed in successfully");
            } else {
                toast.error(data.message);   
            }
            thunkAPI.dispatch(setLoading(false));
            return data.success
        } catch (e){
            console.log(e);
            toast.error("Failed to sign in! Try later.")
            thunkAPI.dispatch(setLoading(false));
        }
    }
)

// Sign out
export const signOut = createAsyncThunk(
    'user/logOut',
    async (arg, thunkAPI) => {
        localStorage.clear();
        thunkAPI.dispatch(setUser(null));
    }
)

export const authentication = createAsyncThunk(
    "authentication",
    async (arg, thunkAPI) => {
        const user = localStorage.getItem('user');
        if(!user){
            const {data} = await axios.get(`http://localhost:3200/users/details/${user.id}`);
            console.log(data);
            if(data.success){
                thunkAPI.dispatch(setUser(data.data));
                localStorage.setItem('user', data.data);
            } else {
                localStorage.clear();
                setUser(null);
                toast.info("Your session has expired! Please login.")
            }
        } else {
            const parsedUser = JSON.parse(user);
            thunkAPI.dispatch(setUser(parsedUser));
        }
    }
)

export const resetPassword = createAsyncThunk(
    "user/resetPassword",
    async (values, thunkAPI) => {
        try{
            console.log(values);
            const {data} = await axios.patch(`http://localhost:3200/users/password/reset`, {
                ...values
            });
            if(data.success){
                thunkAPI.dispatch(signOut());
                toast.success(data.message);
            } else {
                toast.error(data.message);   
            }
            return data.success;
        } catch (e){
            console.log(e);
            toast.error("Failed to change password! Try later.")
        }
    }
)

export const getEmail = createAsyncThunk(
    "sendEmail",
    async (email, thunkAPI) => {
        const {data} = await axios.post('http://localhost:3200/users/password/email', {
            email
        });
        if(data.success){
            toast.success(data.message);
            return true;
        } else {
            toast.error(data.message);
        }
    }
)

const userSlice = createSlice({
    name:'userInfo',
    initialState:INITIAL_STATE,
    reducers:{
        setUser: (state, action) => {
            state.user = action.payload
        },
        setLoading:(state, action)=> {
            state.loading = action.payload
        }
    }
})

export const userReducer = userSlice.reducer;
export const { setUser, setLoading } = userSlice.actions;
export const userSelector = (state) => state.userReducer.user;
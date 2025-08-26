import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  data: null,
  status: "idle",
  error: null,
  isOnboardingComplete: false,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setProfile(state, action) {
      const profileData = action.payload;
      
      // Handle different response formats
      if (profileData?.user) {
        // If response contains user object
        state.data = profileData.user;
      } else if (profileData?.userData) {
        // If response contains userData object
        state.data = profileData.userData;
      } else {
        // Direct profile data
        state.data = profileData;
      }
      
      // Update onboarding status
      if (state.data?.onboardingCompleted !== undefined) {
        state.isOnboardingComplete = state.data.onboardingCompleted;
      }
      
      state.status = "succeeded";
      state.error = null;
      
      console.log("Profile updated in Redux:", state.data);
    },
    clearProfile(state) {
      state.data = null;
      state.status = "idle";
      state.error = null;
      state.isOnboardingComplete = false;
    },
    setProfileStatus(state, action) {
      state.status = action.payload;
    },
    setProfileError(state, action) {
      state.error = action.payload;
      state.status = "failed";
    },
    markOnboardingComplete(state) {
      state.isOnboardingComplete = true;
      if (state.data) {
        state.data.onboardingCompleted = true;
      }
    },
  },
});

export const { 
  setProfile, 
  clearProfile, 
  setProfileStatus, 
  setProfileError,
  markOnboardingComplete 
} = profileSlice.actions;

export default profileSlice.reducer;
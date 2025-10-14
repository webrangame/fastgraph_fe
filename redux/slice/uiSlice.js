import { createSlice } from '@reduxjs/toolkit';

const initialState = {
	sidebar: {
		logWidth: 450,
		endNodeWidth: 400,
	},
};

const uiSlice = createSlice({
	name: 'ui',
	initialState,
	reducers: {
		setLogSidebarWidth(state, action) {
			// Ensure sidebar object exists
			if (!state.sidebar) {
				state.sidebar = {};
			}
			state.sidebar.logWidth = action.payload;
		},
		setEndNodeSidebarWidth(state, action) {
			// Ensure sidebar object exists
			if (!state.sidebar) {
				state.sidebar = {};
			}
			state.sidebar.endNodeWidth = action.payload;
		},
	},
});

export const { setLogSidebarWidth, setEndNodeSidebarWidth } = uiSlice.actions;
export default uiSlice.reducer;



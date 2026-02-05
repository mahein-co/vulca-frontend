import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // Structure par page pour isoler les contextes
  dashboard: {
    activeFilter: null,
    filteredData: null,
    isLoadingData: false,
  },
  finance: {
    activeFilter: null,
    filteredData: null,
    isLoadingData: false,
  },
  currentPage: "dashboard", // Pour savoir quel contexte utiliser par défaut
};

export const dashboardFilterSlice = createSlice({
  name: "dashboardFilter",
  initialState,
  reducers: {
    // Définit la page actuelle (utile pour le chatbot)
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload; // "dashboard" ou "finance"
    },

    // SET ACTIVE FILTER
    setActiveFilter: (state, action) => {
      const { filterType, filterValue, filterLabel, page = "dashboard" } = action.payload;
      state[page].activeFilter = {
        type: filterType,
        value: filterValue,
        label: filterLabel,
        appliedAt: new Date().toISOString(),
      };
    },
    
    // Stocker les données filtrées
    setFilteredData: (state, action) => {
      const { data, page = "dashboard" } = action.payload;
      state[page].filteredData = data;
      state[page].isLoadingData = false;
    },
    
    // Indiquer le chargement
    setLoadingData: (state, action) => {
      const { isLoading, page = "dashboard" } = action.payload;
      state[page].isLoadingData = isLoading;
    },
    
    // CLEAR ACTIVE FILTER
    clearActiveFilter: (state, action) => {
      const page = action.payload || "dashboard";
      state[page].activeFilter = null;
      state[page].filteredData = null;
    },
  },
});

// Actions
export const { 
  setActiveFilter, 
  clearActiveFilter, 
  setFilteredData,
  setLoadingData,
  setCurrentPage
} = dashboardFilterSlice.actions;

// Selectors
export const selectCurrentPage = (state) => state.dashboardFilter.currentPage;

// Sélecteur intelligent qui retourne les données de la page actuelle
export const selectFilteredData = (state) => {
  const page = state.dashboardFilter.currentPage;
  return state.dashboardFilter[page]?.filteredData;
};

export const selectActiveFilter = (state) => {
  const page = state.dashboardFilter.currentPage;
  return state.dashboardFilter[page]?.activeFilter;
};

export const selectIsLoadingData = (state) => {
  const page = state.dashboardFilter.currentPage;
  return state.dashboardFilter[page]?.isLoadingData;
};

export const selectActiveFilterJSON = (state) => {
  const page = state.dashboardFilter.currentPage;
  const context = state.dashboardFilter[page];
  
  if (!context?.activeFilter) return null;
  
  return {
    [context.activeFilter.type]: context.activeFilter.value,
    data: context.filteredData,
  };
};

export default dashboardFilterSlice.reducer;

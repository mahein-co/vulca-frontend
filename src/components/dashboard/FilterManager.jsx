import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setActiveFilter, 
  clearActiveFilter, 
  selectActiveFilter,
  selectActiveFilterJSON,
  setFilteredData,
  setLoadingData,
  selectIsLoadingData,
  setCurrentPage
} from '../../states/dashboard/dashboardFilterSlice';
import { fetchWithReauth } from '../../utils/apiUtils';
import { BASE_URL_API } from '../../constants/globalConstants';

const FilterManager = ({ page = "dashboard" }) => { 
  const dispatch = useDispatch();
  
  // Synchroniser la page actuelle pour le chatbot
  React.useEffect(() => {
    dispatch(setCurrentPage(page));
  }, [page, dispatch]);

  const activeFilter = useSelector(selectActiveFilter);
  const activeFilterJSON = useSelector(selectActiveFilterJSON);
  const isLoadingData = useSelector(selectIsLoadingData);
  
  const currentYear = new Date().getFullYear();
  const [dateStart, setDateStart] = useState(activeFilter?.value?.start || `${currentYear}-01-01`);
  const [dateEnd, setDateEnd] = useState(activeFilter?.value?.end || new Date().toISOString().split('T')[0]);

  const handleApplyFilter = async (start, end) => {
    dispatch(setActiveFilter({
      filterType: 'date',
      filterValue: { start, end },
      filterLabel: `${new Date(start).toLocaleDateString('fr-FR')} - ${new Date(end).toLocaleDateString('fr-FR')}`,
      page: page
    }));
    
    dispatch(setLoadingData({ isLoading: true, page }));
    try {
      const url = `${BASE_URL_API}/filtered-data/?date_start=${start}&date_end=${end}`;
      const response = await fetchWithReauth(url);
      const data = await response.json();
      
      if (!data.error) {
        dispatch(setFilteredData({ data, page }));
      }
    } catch (error) {
      console.error('Erreur filtrage:', error);
    } finally {
      dispatch(setLoadingData({ isLoading: false, page }));
    }
  };

  // NOUVEAU: Auto-Apply quand les dates changent
  React.useEffect(() => {
    handleApplyFilter(dateStart, dateEnd);
  }, [dateStart, dateEnd, page]); // Se déclenche au changement de n'importe quelle date

  const handleClearFilter = () => {
    dispatch(clearActiveFilter(page));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow-md border-t-2 border-gray-300 dark:border-gray-700 mb-4">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        {/* Infos & Titre */}
        <div className="mb-2 lg:mb-0">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊</span>
            <p className="font-semibold text-gray-800 dark:text-gray-100">Tableau de bord</p>
            {isLoadingData && <span className="text-xs text-blue-500 animate-pulse">⏳ Calcul...</span>}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Période d'exercice</p>
        </div>

        {/* Inputs Directs (Style "Avant", sans bouton Appliquer) */}
        <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm w-full lg:w-auto">
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Du</label>
            <input
              type="date"
              value={dateStart}
              onChange={(e) => setDateStart(e.target.value)}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Au</label>
            <input
              type="date"
              value={dateEnd}
              onChange={(e) => setDateEnd(e.target.value)}
              className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          
          <div className="flex gap-2">
            {/* Boutons d'action supprimés au profit de l'auto-apply */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterManager;

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

const FilterManager = ({ page = "dashboard", rightAction = null, hidePeriod = false }) => {
  const dispatch = useDispatch();

  // Synchroniser la page actuelle pour le chatbot
  React.useEffect(() => {
    dispatch(setCurrentPage(page));
  }, [page, dispatch]);

  const activeFilter = useSelector(state => state.dashboardFilter[page]?.activeFilter);
  const activeFilterJSON = useSelector(selectActiveFilterJSON);
  const isLoadingData = useSelector(selectIsLoadingData);

  // Calculer 6 mois glissants par défaut
  const dStart = new Date();
  // On recule de 6 mois par rapport à AUJOURD'HUI
  dStart.setMonth(dStart.getMonth() - 6);
  // On se cale au 1er du mois pour avoir une période propre
  dStart.setDate(1);
  const defaultDateStart = dStart.toISOString().split('T')[0];
  const defaultDateEnd = new Date().toISOString().split('T')[0];

  const [dateStart, setDateStart] = useState(activeFilter?.value?.start || defaultDateStart);
  const [dateEnd, setDateEnd] = useState(activeFilter?.value?.end || defaultDateEnd);

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

  // Ref pour tracker les dernières dates appliquées et éviter les rechargements inutiles
  const lastAppliedRef = React.useRef({ start: null, end: null, page: null });

  // Auto-Apply UNIQUEMENT si les dates ont vraiment changé (pas sur simple re-render parent)
  React.useEffect(() => {
    const last = lastAppliedRef.current;
    if (last.start === dateStart && last.end === dateEnd && last.page === page) return;
    lastAppliedRef.current = { start: dateStart, end: dateEnd, page };
    handleApplyFilter(dateStart, dateEnd);
  }, [dateStart, dateEnd, page]);

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
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Période d'exercice</p>
        </div>

        {/* Inputs Directs (Style "Avant", sans bouton Appliquer) */}
        {!hidePeriod && (
          <div className="flex flex-wrap gap-2 sm:space-x-3 items-center text-sm w-full lg:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Du</label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                max={defaultDateEnd}
                className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">Au</label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                max={defaultDateEnd}
                className="p-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs sm:text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div className="flex gap-2">
              {rightAction}
            </div>
          </div>
        )}

        {hidePeriod && rightAction && (
          <div className="flex gap-2">
            {rightAction}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterManager;

/**
 * Custom hook to automatically get the current project_id
 * Used by all RTK Query hooks to ensure cache isolation per project
 */
import React, { useMemo } from 'react';

export const useProjectId = () => {
    return useCurrentProject();
};

/**
 * Hook that re-renders when project changes
 * Useful for components that need to react to project changes
 */
export const useCurrentProject = () => {
    const [projectId, setProjectId] = React.useState(
        localStorage.getItem('selectedProjectId')
    );

    React.useEffect(() => {
        const handleStorageChange = () => {
            setProjectId(localStorage.getItem('selectedProjectId'));
        };

        // Listen for storage changes
        window.addEventListener('storage', handleStorageChange);

        // Custom event for same-window changes
        window.addEventListener('projectChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('projectChanged', handleStorageChange);
        };
    }, []);

    return projectId;
};

export const useCurrentProjectName = () => {
    const [projectName, setProjectName] = React.useState(
        localStorage.getItem('selectedProjectName') || 'REKAPY'
    );

    React.useEffect(() => {
        const handleStorageChange = () => {
            setProjectName(localStorage.getItem('selectedProjectName') || 'REKAPY');
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('projectChanged', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('projectChanged', handleStorageChange);
        };
    }, []);

    return projectName;
};

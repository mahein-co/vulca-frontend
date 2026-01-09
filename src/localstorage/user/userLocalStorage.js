// Save user info to localStorage
export const saveCurrentUserToLS = (userInfo) => {
    try {
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } catch (error) {
        console.error('Error saving user to localStorage:', error);
    }
};

// Get user info from localStorage
export const getCurrentUserFromLS = () => {
    try {
        const userInfo = localStorage.getItem('userInfo');
        return userInfo ? JSON.parse(userInfo) : null;
    } catch (error) {
        console.error('Error getting user from localStorage:', error);
        return null;
    }
};

// Remove user info from localStorage
export const removeCurrentUserFromLS = () => {
    try {
        localStorage.removeItem('userInfo');
    } catch (error) {
        console.error('Error removing user from localStorage:', error);
    }
};

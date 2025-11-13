export const calculateFileSizeInMB = (fileSizeInBytes) => {
  const sizeInKB = (fileSizeInBytes / 1024).toFixed(2); // Convert to KB
  const sizeInMB = (fileSizeInBytes / (1024 * 1024)).toFixed(2); // Convert to MB
  if (sizeInMB < 1) {
    return `${sizeInKB} KB`;
  } else {
    return `${sizeInMB} MB`;
  }
};

const response = (message: string, data: any, success?: boolean) => {
  return {
    message: formatMessage(message),
    data: data || null,
    success: success == null ? true : success,
  };
};

const formatMessage = (str: string) => {
  if (!str) return "";

  // Make first letter capital
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default response;

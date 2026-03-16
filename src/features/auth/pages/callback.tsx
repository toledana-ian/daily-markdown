import { Navigate } from '@tanstack/react-router';

export const CallbackPage = () => {
  // the layout will handle the redirection if login is successful or loading
  // this will only be rendered if the user is not authenticated
  return <Navigate to='/login' />;
};

export default CallbackPage;

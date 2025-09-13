// Example usage of the new getDataCreatedBy API endpoint

import { useGetDataCreatedByQuery } from './redux/api/autoOrchestrate/autoOrchestrateApi';

// Example component using the new API
function UserDataComponent({ userId }) {
  // Use the new query hook
  const { 
    data, 
    error, 
    isLoading, 
    isSuccess, 
    isError 
  } = useGetDataCreatedByQuery(userId);

  if (isLoading) return <div>Loading user data...</div>;
  if (isError) return <div>Error: {error?.message}</div>;
  if (isSuccess) {
    return (
      <div>
        <h3>Data created by user {userId}:</h3>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    );
  }

  return null;
}

// Example usage with different user IDs
function App() {
  return (
    <div>
      <UserDataComponent userId={1} />
      <UserDataComponent userId={2} />
    </div>
  );
}

export default App;

// Import logger wherever you need it
import logger from '../utils/logger';

// In API routes (pages/api/users.ts)
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  logger.info('API called: /api/users');
  
  try {
    // Your code here
    const users = getUsers();
    logger.info(`Found ${users.length} users`);
    res.json(users);
  } catch (error) {
    logger.error(`Error in users API: ${error}`);
    res.status(500).json({ error: 'Server error' });
  }
}
----------------------------------------------------------------------------
// In React components
// import logger from '../utils/logger';

const MyComponent = () => {
  const handleClick = () => {
    logger.info('Button clicked by user');
    // Your logic here
  };

  useEffect(() => {
    logger.debug('Component mounted - MyComponent');
  }, []);

  return <button onClick={handleClick}>Click me</button>;
};

// In any service/utility file
import logger from '../utils/logger';

export const fetchData = async () => {
  logger.debug('Starting data fetch process');
  logger.info('Fetching user data from API');
  
  try {
    const response = await fetch('/api/data');
    logger.info('Data fetched successfully');
    logger.debug(`Response status: ${response.status}`);
    return response.json();
  } catch (error) {
    logger.error(`Data fetch failed: ${error}`);
    throw error;
  }
};

// All available log levels (from highest to lowest priority):

// ERROR - Critical errors that need immediate attention
logger.error('Database connection failed');
logger.error('Payment processing error', { userId: 123, amount: 50 });

// WARN - Warning conditions, potential issues
logger.warn('API response time is slow (>2s)');
logger.warn('User attempted invalid action', { action: 'delete_admin' });

// INFO - General information, normal flow
logger.info('User logged in successfully');
logger.info('Email sent to user', { recipient: 'user@email.com' });

// HTTP - HTTP requests (custom level)
logger.http('POST /api/users - 201 Created');
logger.http('GET /api/data - 200 OK - 150ms');

// VERBOSE - Detailed information for debugging
logger.verbose('Cache hit for user preferences');
logger.verbose('Processing batch job', { batchId: 'batch_123', items: 50 });

// DEBUG - Debug information for development
logger.debug('Variable value check', { userId: 123, isActive: true });
logger.debug('Function called: calculateTotal()');

// SILLY - Most detailed level, trace-level info
logger.silly('Loop iteration', { index: 5, total: 100 });
logger.silly('Memory usage', { used: '45MB', total: '128MB' });

// You can also add metadata to any log level
logger.info('User action completed', {
  userId: 123,
  action: 'profile_update',
  timestamp: new Date(),
  ip: '192.168.1.1'
});
import { cricketAPIService } from './cricket-api';

let apiKeyPrompted = false;

export async function askForCricketAPIKey(): Promise<void> {
  if (apiKeyPrompted) {
    return;
  }
  
  apiKeyPrompted = true;
  
  // Check if API key is already set in environment variables
  const existingKey = process.env.CRICKET_API_KEY;
  if (existingKey) {
    cricketAPIService.setApiKey(existingKey);
    console.log('Using Cricket API key from environment variables');
    return;
  }
  
  // Adjust how we check for API keys in Replit
  try {
    const cricketApiKey = process.env.CRICKET_API_KEY;
    if (cricketApiKey) {
      cricketAPIService.setApiKey(cricketApiKey);
      console.log('Successfully set up Cricket API with provided key');
      return;
    }
  } catch (error) {
    console.error('Error accessing Cricket API key:', error);
  }

  console.log('\n' + '='.repeat(80));
  console.log('CRICKET API INTEGRATION');
  console.log('='.repeat(80));
  console.log('To use real cricket data, you need a Cricket API key.');
  console.log('You can get one by signing up at https://cricapi.com/');
  console.log('The API is free for limited usage (100 requests per day).');
  console.log('\nWithout an API key, the application will use mock cricket data.');
  console.log('For best results, please add your Cricket API key as an environment variable named CRICKET_API_KEY');
  console.log('='.repeat(80) + '\n');
}

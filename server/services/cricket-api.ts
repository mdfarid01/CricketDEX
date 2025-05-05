import axios from 'axios';
import NodeCache from 'node-cache';
import cron from 'node-cron';

// Cache to store API responses (30 min expiry)
const apiCache = new NodeCache({ stdTTL: 1800 });

// Cricket API endpoints
const API_BASE_URL = 'https://cricapi.com/api/v1';
const MATCHES_ENDPOINT = '/matches';
const MATCH_INFO_ENDPOINT = '/match_info';
const SCORECARD_ENDPOINT = '/match_scorecard';

let API_KEY = process.env.CRICKET_API_KEY || '';

interface CricketMatch {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: any[];
  score: any[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

interface CricketMatchInfo {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: any[];
  score: any[];
  tossWinner: string;
  tossChoice: string;
  matchType: string;
  matchWinner: string;
  series_id: string;
  matchStarted: boolean;
  matchEnded: boolean;
}

interface CricketScorecard {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: any[];
  score: any[];
  scorecard: any[];
  matchStarted: boolean;
  matchEnded: boolean;
}

export class CricketAPIService {
  constructor() {
    // Set up cron job to refresh cache every 5 minutes for live matches
    cron.schedule('*/5 * * * *', async () => {
      try {
        console.log('Refreshing cricket API cache...');
        const liveMatches = await this.getMatches('live');
        
        // Update scorecard for each live match
        for (const match of liveMatches) {
          await this.getMatchScorecard(match.id);
        }
      } catch (error) {
        console.error('Error refreshing cricket API cache:', error);
      }
    });
  }

  /**
   * Set the API key
   */
  setApiKey(apiKey: string) {
    API_KEY = apiKey;
  }

  /**
   * Get IPL matches (current or upcoming)
   */
  async getMatches(status: 'live' | 'upcoming' | 'completed' = 'live'): Promise<CricketMatch[]> {
    const cacheKey = `cricket_matches_${status}`;
    
    // Check cache first
    const cachedData = apiCache.get<CricketMatch[]>(cacheKey);
    if (cachedData && cachedData.length > 0) {
      return cachedData;
    }

    try {
      // No cache, call the API
      if (!API_KEY) {
        console.warn('Cricket API key not set. Using mock data.');
        return this.getMockMatches(status);
      }

      const response = await axios.get(`${API_BASE_URL}${MATCHES_ENDPOINT}`, {
        params: {
          apikey: API_KEY,
          offset: 0,
          status,
          search: 'IPL'
        }
      });

      if (response.data && response.data.data && response.data.data.length > 0) {
        const matches = response.data.data;
        // Store in cache
        apiCache.set(cacheKey, matches);
        return matches;
      }
      
      // If API returns no matches, use mock data
      console.log(`No ${status} matches returned from Cricket API. Using mock data.`);
      const mockMatches = this.getMockMatches(status);
      apiCache.set(cacheKey, mockMatches);
      return mockMatches;
    } catch (error) {
      console.error('Error fetching cricket matches:', error);
      return this.getMockMatches(status);
    }
  }

  /**
   * Get detailed information about a specific match
   */
  async getMatchInfo(matchId: string): Promise<CricketMatchInfo | null> {
    const cacheKey = `cricket_match_${matchId}`;
    
    // Check cache first
    const cachedData = apiCache.get<CricketMatchInfo>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // No cache, call the API
      if (!API_KEY) {
        console.warn('Cricket API key not set. Using mock data.');
        return this.getMockMatchInfo(matchId);
      }

      const response = await axios.get(`${API_BASE_URL}${MATCH_INFO_ENDPOINT}`, {
        params: {
          apikey: API_KEY,
          id: matchId
        }
      });

      if (response.data && response.data.data) {
        const matchInfo = response.data.data;
        // Store in cache
        apiCache.set(cacheKey, matchInfo);
        return matchInfo;
      }
      
      // If API returns no match info, use mock data
      console.log(`No match info returned from Cricket API for ID ${matchId}. Using mock data.`);
      const mockMatchInfo = this.getMockMatchInfo(matchId);
      if (mockMatchInfo) {
        apiCache.set(cacheKey, mockMatchInfo);
      }
      return mockMatchInfo;
    } catch (error) {
      console.error('Error fetching match info:', error);
      return this.getMockMatchInfo(matchId);
    }
  }

  /**
   * Get detailed scorecard for a specific match
   */
  async getMatchScorecard(matchId: string): Promise<CricketScorecard | null> {
    const cacheKey = `cricket_scorecard_${matchId}`;
    
    // For live matches, we use a shorter cache duration (1 minute)
    const cachedData = apiCache.get<CricketScorecard>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      // No cache, call the API
      if (!API_KEY) {
        console.warn('Cricket API key not set. Using mock data.');
        return this.getMockScorecard(matchId);
      }

      const response = await axios.get(`${API_BASE_URL}${SCORECARD_ENDPOINT}`, {
        params: {
          apikey: API_KEY,
          id: matchId
        }
      });

      if (response.data && response.data.data) {
        const scorecard = response.data.data;
        // Store in cache
        // Use shorter TTL for live matches (1 minute)
        if (scorecard.matchStarted && !scorecard.matchEnded) {
          apiCache.set(cacheKey, scorecard, 60); // 1 minute TTL
        } else {
          apiCache.set(cacheKey, scorecard);
        }
        return scorecard;
      }
      
      // If API returns no scorecard, use mock data
      console.log(`No scorecard returned from Cricket API for match ID ${matchId}. Using mock data.`);
      const mockScorecard = this.getMockScorecard(matchId);
      if (mockScorecard) {
        // Use shorter TTL for live matches (1 minute) to allow updates
        if (mockScorecard.matchStarted && !mockScorecard.matchEnded) {
          apiCache.set(cacheKey, mockScorecard, 60); // 1 minute TTL
        } else {
          apiCache.set(cacheKey, mockScorecard);
        }
      }
      return mockScorecard;
    } catch (error) {
      console.error('Error fetching match scorecard:', error);
      return this.getMockScorecard(matchId);
    }
  }

  /**
   * Generate mock data for IPL matches when API key is not available
   */
  private getMockMatches(status: 'live' | 'upcoming' | 'completed'): CricketMatch[] {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(now);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    // Mock data based on the status requested
    if (status === 'live') {
      return [
        {
          id: 'live_match_1',
          name: 'Chennai Super Kings vs Mumbai Indians',
          status: 'Chennai Super Kings need 64 runs to win from 42 balls',
          venue: 'M.A. Chidambaram Stadium, Chennai',
          date: now.toISOString().split('T')[0],
          dateTimeGMT: now.toISOString(),
          teams: ['Chennai Super Kings', 'Mumbai Indians'],
          teamInfo: [
            { name: 'Chennai Super Kings', shortname: 'CSK' },
            { name: 'Mumbai Indians', shortname: 'MI' }
          ],
          score: [
            { r: 186, w: 6, o: 20, inning: 'Mumbai Indians' },
            { r: 123, w: 3, o: 13, inning: 'Chennai Super Kings' }
          ],
          series_id: 'ipl_2023',
          fantasyEnabled: true,
          bbbEnabled: true,
          hasSquad: true,
          matchStarted: true,
          matchEnded: false
        },
        {
          id: 'live_match_2',
          name: 'Royal Challengers Bangalore vs Kolkata Knight Riders',
          status: 'Royal Challengers Bangalore won the toss and elected to bat',
          venue: 'M. Chinnaswamy Stadium, Bangalore',
          date: now.toISOString().split('T')[0],
          dateTimeGMT: now.toISOString(),
          teams: ['Royal Challengers Bangalore', 'Kolkata Knight Riders'],
          teamInfo: [
            { name: 'Royal Challengers Bangalore', shortname: 'RCB' },
            { name: 'Kolkata Knight Riders', shortname: 'KKR' }
          ],
          score: [
            { r: 25, w: 1, o: 3.2, inning: 'Royal Challengers Bangalore' }
          ],
          series_id: 'ipl_2023',
          fantasyEnabled: true,
          bbbEnabled: true,
          hasSquad: true,
          matchStarted: true,
          matchEnded: false
        }
      ];
    } else if (status === 'upcoming') {
      return [
        {
          id: 'upcoming_match_1',
          name: 'Delhi Capitals vs Punjab Kings',
          status: 'Match starts at 19:30 IST',
          venue: 'Arun Jaitley Stadium, Delhi',
          date: tomorrow.toISOString().split('T')[0],
          dateTimeGMT: tomorrow.toISOString(),
          teams: ['Delhi Capitals', 'Punjab Kings'],
          teamInfo: [
            { name: 'Delhi Capitals', shortname: 'DC' },
            { name: 'Punjab Kings', shortname: 'PBKS' }
          ],
          score: [],
          series_id: 'ipl_2023',
          fantasyEnabled: true,
          bbbEnabled: true,
          hasSquad: true,
          matchStarted: false,
          matchEnded: false
        },
        {
          id: 'upcoming_match_2',
          name: 'Rajasthan Royals vs Sunrisers Hyderabad',
          status: 'Match starts at 15:30 IST',
          venue: 'Sawai Mansingh Stadium, Jaipur',
          date: dayAfterTomorrow.toISOString().split('T')[0],
          dateTimeGMT: dayAfterTomorrow.toISOString(),
          teams: ['Rajasthan Royals', 'Sunrisers Hyderabad'],
          teamInfo: [
            { name: 'Rajasthan Royals', shortname: 'RR' },
            { name: 'Sunrisers Hyderabad', shortname: 'SRH' }
          ],
          score: [],
          series_id: 'ipl_2023',
          fantasyEnabled: true,
          bbbEnabled: true,
          hasSquad: true,
          matchStarted: false,
          matchEnded: false
        }
      ];
    } else { // completed
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      return [
        {
          id: 'completed_match_1',
          name: 'Gujarat Titans vs Lucknow Super Giants',
          status: 'Gujarat Titans won by 7 wickets',
          venue: 'Narendra Modi Stadium, Ahmedabad',
          date: yesterday.toISOString().split('T')[0],
          dateTimeGMT: yesterday.toISOString(),
          teams: ['Gujarat Titans', 'Lucknow Super Giants'],
          teamInfo: [
            { name: 'Gujarat Titans', shortname: 'GT' },
            { name: 'Lucknow Super Giants', shortname: 'LSG' }
          ],
          score: [
            { r: 142, w: 10, o: 19.5, inning: 'Lucknow Super Giants' },
            { r: 145, w: 3, o: 18.2, inning: 'Gujarat Titans' }
          ],
          series_id: 'ipl_2023',
          fantasyEnabled: true,
          bbbEnabled: true,
          hasSquad: true,
          matchStarted: true,
          matchEnded: true
        }
      ];
    }
  }

  /**
   * Generate mock data for a match when API key is not available
   */
  private getMockMatchInfo(matchId: string): CricketMatchInfo | null {
    const now = new Date();

    // Generate match info based on the match ID
    if (matchId === 'live_match_1') {
      return {
        id: 'live_match_1',
        name: 'Chennai Super Kings vs Mumbai Indians',
        status: 'Chennai Super Kings need 64 runs to win from 42 balls',
        venue: 'M.A. Chidambaram Stadium, Chennai',
        date: now.toISOString().split('T')[0],
        dateTimeGMT: now.toISOString(),
        teams: ['Chennai Super Kings', 'Mumbai Indians'],
        teamInfo: [
          { name: 'Chennai Super Kings', shortname: 'CSK' },
          { name: 'Mumbai Indians', shortname: 'MI' }
        ],
        score: [
          { r: 186, w: 6, o: 20, inning: 'Mumbai Indians' },
          { r: 123, w: 3, o: 13, inning: 'Chennai Super Kings' }
        ],
        tossWinner: 'Mumbai Indians',
        tossChoice: 'bat',
        matchType: 'T20',
        matchWinner: '',
        series_id: 'ipl_2023',
        matchStarted: true,
        matchEnded: false
      };
    } else if (matchId === 'live_match_2') {
      return {
        id: 'live_match_2',
        name: 'Royal Challengers Bangalore vs Kolkata Knight Riders',
        status: 'Royal Challengers Bangalore won the toss and elected to bat',
        venue: 'M. Chinnaswamy Stadium, Bangalore',
        date: now.toISOString().split('T')[0],
        dateTimeGMT: now.toISOString(),
        teams: ['Royal Challengers Bangalore', 'Kolkata Knight Riders'],
        teamInfo: [
          { name: 'Royal Challengers Bangalore', shortname: 'RCB' },
          { name: 'Kolkata Knight Riders', shortname: 'KKR' }
        ],
        score: [
          { r: 25, w: 1, o: 3.2, inning: 'Royal Challengers Bangalore' }
        ],
        tossWinner: 'Royal Challengers Bangalore',
        tossChoice: 'bat',
        matchType: 'T20',
        matchWinner: '',
        series_id: 'ipl_2023',
        matchStarted: true,
        matchEnded: false
      };
    }

    // If no match found, return null
    return null;
  }

  /**
   * Generate mock data for a scorecard when API key is not available
   */
  private getMockScorecard(matchId: string): CricketScorecard | null {
    const now = new Date();

    // Generate scorecard based on the match ID
    if (matchId === 'live_match_1') {
      return {
        id: 'live_match_1',
        name: 'Chennai Super Kings vs Mumbai Indians',
        status: 'Chennai Super Kings need 64 runs to win from 42 balls',
        venue: 'M.A. Chidambaram Stadium, Chennai',
        date: now.toISOString().split('T')[0],
        dateTimeGMT: now.toISOString(),
        teams: ['Chennai Super Kings', 'Mumbai Indians'],
        teamInfo: [
          { name: 'Chennai Super Kings', shortname: 'CSK' },
          { name: 'Mumbai Indians', shortname: 'MI' }
        ],
        score: [
          { r: 186, w: 6, o: 20, inning: 'Mumbai Indians' },
          { r: 123, w: 3, o: 13, inning: 'Chennai Super Kings' }
        ],
        scorecard: [
          {
            inning: 'Mumbai Indians',
            battingStats: [
              { batsman: 'Rohit Sharma', runs: 56, balls: 42, fours: 5, sixes: 2, dismissal: 'c Jadeja b Chahar' },
              { batsman: 'Ishan Kishan', runs: 35, balls: 31, fours: 3, sixes: 1, dismissal: 'c Dhoni b Jadeja' },
              { batsman: 'Suryakumar Yadav', runs: 43, balls: 29, fours: 1, sixes: 3, dismissal: 'c Gaikwad b Thakur' },
              { batsman: 'Hardik Pandya', runs: 22, balls: 10, fours: 1, sixes: 2, dismissal: 'c Santner b Chahar' },
              { batsman: 'Kieron Pollard', runs: 15, balls: 6, fours: 1, sixes: 1, dismissal: 'not out' },
            ],
            bowlingStats: [
              { bowler: 'Deepak Chahar', overs: 4, runs: 39, wickets: 2, economy: 9.75 },
              { bowler: 'Ravindra Jadeja', overs: 4, runs: 34, wickets: 1, economy: 8.50 },
              { bowler: 'Shardul Thakur', overs: 4, runs: 42, wickets: 1, economy: 10.50 },
              { bowler: 'Moeen Ali', overs: 4, runs: 32, wickets: 1, economy: 8.00 },
              { bowler: 'Mitchell Santner', overs: 4, runs: 36, wickets: 1, economy: 9.00 },
            ]
          },
          {
            inning: 'Chennai Super Kings',
            battingStats: [
              { batsman: 'Ruturaj Gaikwad', runs: 58, balls: 42, fours: 6, sixes: 1, dismissal: 'not out' },
              { batsman: 'Devon Conway', runs: 28, balls: 22, fours: 3, sixes: 0, dismissal: 'c Ishan Kishan b Bumrah' },
              { batsman: 'Moeen Ali', runs: 18, balls: 12, fours: 1, sixes: 1, dismissal: 'c Suryakumar b Chahal' },
              { batsman: 'MS Dhoni', runs: 16, balls: 6, fours: 0, sixes: 2, dismissal: 'not out' },
            ],
            bowlingStats: [
              { bowler: 'Jasprit Bumrah', overs: 4, runs: 24, wickets: 1, economy: 6.00 },
              { bowler: 'Trent Boult', overs: 3, runs: 28, wickets: 0, economy: 9.33 },
              { bowler: 'Yuzvendra Chahal', overs: 4, runs: 36, wickets: 1, economy: 9.00 },
              { bowler: 'Krunal Pandya', overs: 2, runs: 22, wickets: 1, economy: 11.00 },
            ]
          }
        ],
        matchStarted: true,
        matchEnded: false
      };
    }

    // If no match found, return null
    return null;
  }
}

export const cricketAPIService = new CricketAPIService();


import { dataFlowAnalyzer } from './DataFlowAnalyzer';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase/client';

// User flow test types
export interface UserFlowStep {
  id: string;
  name: string;
  description: string;
  action: (params?: any) => Promise<any>;
  expectedResult: (result: any) => boolean;
  cleanup?: () => Promise<void>;
}

export interface UserFlowTest {
  id: string;
  name: string;
  description: string;
  steps: UserFlowStep[];
  setup?: () => Promise<void>;
  teardown?: () => Promise<void>;
}

export interface UserFlowResult {
  flowId: string;
  success: boolean;
  steps: {
    stepId: string;
    success: boolean;
    error?: string;
    data?: any;
  }[];
  duration: number;
  timestamp: number;
}

/**
 * Utility class to simulate and test user flows
 */
export class UserFlowSimulator {
  private static instance: UserFlowSimulator;
  private flows: Map<string, UserFlowTest> = new Map();
  private results: UserFlowResult[] = [];
  
  private constructor() {}
  
  public static getInstance(): UserFlowSimulator {
    if (!UserFlowSimulator.instance) {
      UserFlowSimulator.instance = new UserFlowSimulator();
    }
    return UserFlowSimulator.instance;
  }
  
  /**
   * Register a new user flow test
   */
  public registerFlow(flow: UserFlowTest): void {
    this.flows.set(flow.id, flow);
  }
  
  /**
   * Run a specific user flow test
   */
  public async runFlow(flowId: string): Promise<UserFlowResult> {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow with ID ${flowId} not found`);
    }
    
    console.log(`Starting user flow test: ${flow.name}`);
    const startTime = performance.now();
    
    const result: UserFlowResult = {
      flowId,
      success: true,
      steps: [],
      duration: 0,
      timestamp: Date.now()
    };
    
    try {
      // Run setup if provided
      if (flow.setup) {
        console.log(`Running setup for flow: ${flow.name}`);
        await flow.setup();
      }
      
      // Start tracking the flow
      dataFlowAnalyzer.startUserFlow(flowId, flow.description);
      
      // Run each step
      for (const step of flow.steps) {
        console.log(`Running step: ${step.name}`);
        
        try {
          // Track the step in the data flow analyzer
          dataFlowAnalyzer.trackFlowStep(
            flowId,
            step.id,
            step.name,
            { description: step.description }
          );
          
          // Run the step action
          const stepResult = await step.action();
          
          // Check if the result matches expectations
          const stepSuccess = step.expectedResult(stepResult);
          
          result.steps.push({
            stepId: step.id,
            success: stepSuccess,
            data: stepResult
          });
          
          if (!stepSuccess) {
            console.warn(`Step ${step.name} failed: result did not match expectations`);
            result.success = false;
          }
          
          // Run cleanup if provided
          if (step.cleanup) {
            await step.cleanup();
          }
        } catch (error) {
          console.error(`Error in step ${step.name}:`, error);
          
          result.steps.push({
            stepId: step.id,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
          
          result.success = false;
        }
      }
    } catch (error) {
      console.error(`Error running flow ${flow.name}:`, error);
      result.success = false;
    } finally {
      // End tracking the flow
      dataFlowAnalyzer.endUserFlow(flowId);
      
      // Run teardown if provided
      if (flow.teardown) {
        try {
          console.log(`Running teardown for flow: ${flow.name}`);
          await flow.teardown();
        } catch (error) {
          console.error(`Error in teardown for flow ${flow.name}:`, error);
        }
      }
      
      const endTime = performance.now();
      result.duration = endTime - startTime;
      
      console.log(`Completed user flow test: ${flow.name} (${result.success ? 'Success' : 'Failed'})`);
      
      this.results.push(result);
    }
    
    return result;
  }
  
  /**
   * Run all registered user flow tests
   */
  public async runAllFlows(): Promise<UserFlowResult[]> {
    const results: UserFlowResult[] = [];
    
    for (const flowId of this.flows.keys()) {
      const result = await this.runFlow(flowId);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * Get results of all user flow tests
   */
  public getResults(): UserFlowResult[] {
    return [...this.results];
  }
  
  /**
   * Get results for a specific user flow test
   */
  public getResultsForFlow(flowId: string): UserFlowResult[] {
    return this.results.filter(result => result.flowId === flowId);
  }
  
  /**
   * Clear all results
   */
  public clearResults(): void {
    this.results = [];
  }
  
  /**
   * Reset the simulator
   */
  public reset(): void {
    this.flows.clear();
    this.results = [];
  }
}

// Export singleton instance
export const userFlowSimulator = UserFlowSimulator.getInstance();

// Example user flows for critical paths
export const registerAuthenticationFlow = () => {
  userFlowSimulator.registerFlow({
    id: 'auth-flow',
    name: 'User Authentication Flow',
    description: 'Tests the complete user authentication flow from login to profile access',
    steps: [
      {
        id: 'auth-login',
        name: 'User Login',
        description: 'User enters credentials and submits login form',
        action: async (params?: { email: string; password: string }) => {
          const { email, password } = params || { 
            email: 'test@example.com', 
            password: 'password123' 
          };
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          return { data, error };
        },
        expectedResult: (result) => {
          return result.data?.user != null && !result.error;
        }
      },
      {
        id: 'auth-get-profile',
        name: 'Fetch User Profile',
        description: 'System fetches the user profile after successful login',
        action: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No authenticated user found');
          }
          
          const { data, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          return { profile: data, error };
        },
        expectedResult: (result) => {
          return result.profile != null && !result.error;
        }
      },
      {
        id: 'auth-logout',
        name: 'User Logout',
        description: 'User logs out of the system',
        action: async () => {
          const { error } = await supabase.auth.signOut();
          return { error };
        },
        expectedResult: (result) => {
          return !result.error;
        }
      }
    ],
    setup: async () => {
      // Ensure we're logged out before starting
      await supabase.auth.signOut();
    },
    teardown: async () => {
      // Ensure we're logged out after the test
      await supabase.auth.signOut();
    }
  });
};

export const registerReflectionFlow = () => {
  userFlowSimulator.registerFlow({
    id: 'reflection-flow',
    name: 'Energy Reflection Flow',
    description: 'Tests submitting a reflection and viewing reflections history',
    steps: [
      {
        id: 'reflection-login',
        name: 'User Login',
        description: 'User logs in to submit a reflection',
        action: async (params?: { email: string; password: string }) => {
          const { email, password } = params || { 
            email: 'test@example.com', 
            password: 'password123' 
          };
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          return { data, error };
        },
        expectedResult: (result) => {
          return result.data?.user != null && !result.error;
        }
      },
      {
        id: 'reflection-submit',
        name: 'Submit Reflection',
        description: 'User submits a new energy reflection',
        action: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No authenticated user found');
          }
          
          const reflectionContent = `Test reflection at ${new Date().toISOString()}`;
          
          const { data, error } = await supabase
            .from('energy_reflections')
            .insert({
              user_id: user.id,
              content: reflectionContent,
              points_earned: 5
            })
            .select()
            .single();
          
          return { reflection: data, error };
        },
        expectedResult: (result) => {
          return result.reflection != null && !result.error;
        }
      },
      {
        id: 'reflection-list',
        name: 'View Reflections',
        description: 'User views their reflection history',
        action: async () => {
          const { data: { user } } = await supabase.auth.getUser();
          
          if (!user) {
            throw new Error('No authenticated user found');
          }
          
          const { data, error } = await supabase
            .from('energy_reflections')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          
          return { reflections: data, error };
        },
        expectedResult: (result) => {
          return Array.isArray(result.reflections) && 
                 result.reflections.length > 0 && 
                 !result.error;
        }
      },
      {
        id: 'reflection-logout',
        name: 'User Logout',
        description: 'User logs out after viewing reflections',
        action: async () => {
          const { error } = await supabase.auth.signOut();
          return { error };
        },
        expectedResult: (result) => {
          return !result.error;
        }
      }
    ],
    setup: async () => {
      // Ensure we're logged out before starting
      await supabase.auth.signOut();
    },
    teardown: async () => {
      // Ensure we're logged out after the test
      await supabase.auth.signOut();
    }
  });
};

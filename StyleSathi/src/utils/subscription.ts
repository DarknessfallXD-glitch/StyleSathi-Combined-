import AsyncStorage from '@react-native-async-storage/async-storage';

export type SubscriptionPlan = 'free' | 'monthly' | 'yearly';
export type SubscriptionStatus = {
  plan: SubscriptionPlan;
  isActive: boolean;
  expiryDate?: string;
  features: string[];
};

// Get current subscription from local storage
export const getLocalSubscription = async (): Promise<SubscriptionStatus> => {
  try {
    const data = await AsyncStorage.getItem('subscription');
    if (data) {
      return JSON.parse(data);
    }
    // Default free subscription for new users
    const freeSubscription: SubscriptionStatus = {
      plan: 'free',
      isActive: true,
      features: [
        '3 AI Try-on Tries',
        'Standard Image Quality',
        'Save up to 5 Items',
        'Browse 100+ Brands',
        'AI-Wardrobe History',
        'Price Drop Alerts',
      ],
    };
    await AsyncStorage.setItem('subscription', JSON.stringify(freeSubscription));
    return freeSubscription;
  } catch (error) {
    console.error('Error getting subscription:', error);
    return { plan: 'free', isActive: true, features: [] };
  }
};

// Update local subscription
export const updateLocalSubscription = async (subscription: SubscriptionStatus) => {
  try {
    await AsyncStorage.setItem('subscription', JSON.stringify(subscription));
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
};

// Get features for specific plan
export const getFeaturesForPlan = (plan: SubscriptionPlan): string[] => {
  const features = {
    free: [
      '3 AI Try-on Tries',
      'Standard Image Quality',
      'Save up to 5 Items',
      'Browse 100+ Brands',
      'AI-Wardrobe History',
      'Price Drop Alerts',
    ],
    monthly: [
      'Unlimited AI Try-ons',
      'HD Render Quality',
      'Unlimited Saved Items',
      'Priority Brand Access',
      'Full Wardrobe Export',
      'Real-time Price Alerts',
    ],
    yearly: [
      'All Monthly Features',
      'Dedicated Style Assistant',
      'Exclusive Member Discounts',
      '2 Months Free',
      'VIP Customer Support',
    ],
  };
  return features[plan];
};

// Send subscription data to backend
export const sendSubscriptionToBackend = async (
  userId: string,
  plan: SubscriptionPlan,
  planName: string,
  amount: number
): Promise<{ success: boolean; message?: string }> => {
  try {
    const requestBody = {
      userId: userId,
      plan: plan,
      planName: planName,
      amount: amount,
      currency: 'INR',
      timestamp: new Date().toISOString(),
    };

    console.log('Sending to backend:', JSON.stringify(requestBody, null, 2));

    // Replace with your actual backend URL
    const response = await fetch('http://localhost:3000/api/subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    
    if (response.ok) {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.message || 'Upgrade failed' };
    }
  } catch (error) {
    console.error('Error sending to backend:', error);
    return { success: false, message: 'Network error. Please try again.' };
  }
};
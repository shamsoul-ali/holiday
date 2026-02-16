// Authentication Client for Holiday AI Platform
// This module handles user authentication and favorites functionality

interface User {
  id: string
  email?: string
  name?: string
}

interface Favorite {
  id: string
  user_id: string
  type: 'itinerary' | 'destination' | 'hotel'
  reference_id: string
  created_at: string
  updated_at: string
}

interface FavoriteResponse {
  data: Favorite[] | null
  error?: string
}

export const favorites = {
  async getUserFavorites(userId: string): Promise<FavoriteResponse> {
    try {
      // Mock implementation - in production this would call your backend API
      const mockFavorites: Favorite[] = JSON.parse(
        localStorage.getItem(`favorites_${userId}`) || '[]'
      )
      
      return {
        data: mockFavorites
      }
    } catch (error) {
      console.error('Error getting user favorites:', error)
      return {
        data: null,
        error: 'Failed to fetch favorites'
      }
    }
  },

  async addFavorite(userId: string, type: Favorite['type'], referenceId: string): Promise<{ data?: Favorite; error?: string }> {
    try {
      const newFavorite: Favorite = {
        id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: userId,
        type,
        reference_id: referenceId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Get existing favorites
      const existingFavorites: Favorite[] = JSON.parse(
        localStorage.getItem(`favorites_${userId}`) || '[]'
      )

      // Check if already exists
      const alreadyExists = existingFavorites.some(
        fav => fav.type === type && fav.reference_id === referenceId
      )

      if (alreadyExists) {
        return {
          error: 'Item is already in favorites'
        }
      }

      // Add new favorite
      existingFavorites.push(newFavorite)
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(existingFavorites))

      return {
        data: newFavorite
      }
    } catch (error) {
      console.error('Error adding favorite:', error)
      return {
        error: 'Failed to add favorite'
      }
    }
  },

  async removeFavorite(userId: string, type: Favorite['type'], referenceId: string): Promise<{ success?: boolean; error?: string }> {
    try {
      // Get existing favorites
      const existingFavorites: Favorite[] = JSON.parse(
        localStorage.getItem(`favorites_${userId}`) || '[]'
      )

      // Remove the favorite
      const updatedFavorites = existingFavorites.filter(
        fav => !(fav.type === type && fav.reference_id === referenceId)
      )

      // Save back to localStorage
      localStorage.setItem(`favorites_${userId}`, JSON.stringify(updatedFavorites))

      return {
        success: true
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      return {
        error: 'Failed to remove favorite'
      }
    }
  },

  async toggleFavorite(userId: string, type: Favorite['type'], referenceId: string): Promise<{ isFavorite: boolean; error?: string }> {
    try {
      const { data: existingFavorites } = await this.getUserFavorites(userId)
      
      if (!existingFavorites) {
        return { isFavorite: false, error: 'Failed to fetch favorites' }
      }

      const isFavorite = existingFavorites.some(
        fav => fav.type === type && fav.reference_id === referenceId
      )

      if (isFavorite) {
        await this.removeFavorite(userId, type, referenceId)
        return { isFavorite: false }
      } else {
        await this.addFavorite(userId, type, referenceId)
        return { isFavorite: true }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      return {
        isFavorite: false,
        error: 'Failed to toggle favorite'
      }
    }
  },

  async isFavorited(userId: string, type: Favorite['type'], referenceId: string): Promise<{ data: boolean; error?: string }> {
    try {
      const { data: existingFavorites } = await this.getUserFavorites(userId)
      
      if (!existingFavorites) {
        return { data: false, error: 'Failed to fetch favorites' }
      }

      const isFavorite = existingFavorites.some(
        fav => fav.type === type && fav.reference_id === referenceId
      )

      return { data: isFavorite }
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return {
        data: false,
        error: 'Failed to check favorite status'
      }
    }
  }
}

// Auth helper functions (mock implementations)
export const auth = {
  getCurrentUser(): User | null {
    try {
      const user = localStorage.getItem('current_user')
      return user ? JSON.parse(user) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  },

  async signIn(email: string, password: string): Promise<{ user?: User; error?: string }> {
    try {
      // Mock sign in - in production this would call your auth API
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0]
      }
      
      localStorage.setItem('current_user', JSON.stringify(mockUser))
      
      return { user: mockUser }
    } catch (error) {
      console.error('Error signing in:', error)
      return { error: 'Failed to sign in' }
    }
  },

  async signOut(): Promise<{ success?: boolean; error?: string }> {
    try {
      localStorage.removeItem('current_user')
      return { success: true }
    } catch (error) {
      console.error('Error signing out:', error)
      return { error: 'Failed to sign out' }
    }
  },

  async signUp(email: string, password: string, name?: string): Promise<{ user?: User; error?: string }> {
    try {
      // Mock sign up - in production this would call your auth API
      const mockUser: User = {
        id: `user_${Date.now()}`,
        email,
        name: name || email.split('@')[0]
      }
      
      localStorage.setItem('current_user', JSON.stringify(mockUser))
      
      return { user: mockUser }
    } catch (error) {
      console.error('Error signing up:', error)
      return { error: 'Failed to sign up' }
    }
  }
}

// Itineraries module (mock implementation)
export const itineraries = {
  async getUserItineraries(userId: string) {
    try {
      const userItineraries = JSON.parse(
        localStorage.getItem(`itineraries_${userId}`) || '[]'
      )
      return { data: userItineraries }
    } catch (error) {
      console.error('Error getting user itineraries:', error)
      return { data: null, error: 'Failed to fetch itineraries' }
    }
  },

  async saveItinerary(itineraryData: any) {
    try {
      const userId = itineraryData.user_id
      if (!userId) {
        throw new Error('user_id is required')
      }

      const existingItineraries = JSON.parse(
        localStorage.getItem(`itineraries_${userId}`) || '[]'
      )
      
      const newItinerary = {
        ...itineraryData,
        id: itineraryData.id || `itin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        savedAt: new Date().toISOString()
      }

      existingItineraries.push(newItinerary)
      localStorage.setItem(`itineraries_${userId}`, JSON.stringify(existingItineraries))

      return { data: newItinerary }
    } catch (error) {
      console.error('Error saving itinerary:', error)
      return { error: 'Failed to save itinerary' }
    }
  }
}

export default { favorites, auth, itineraries }
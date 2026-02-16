import { NextRequest, NextResponse } from 'next/server'

interface CommunityRequest {
  action: 'getPosts' | 'getGroups' | 'getBuddies' | 'createPost' | 'likePost' | 'joinGroup' | 'connectBuddy'
  userId?: string
  postId?: string
  groupId?: string
  buddyId?: string
  data?: any
  filters?: {
    type?: string[]
    location?: string
    interests?: string[]
    travelStyle?: string[]
  }
  pagination?: {
    page: number
    limit: number
  }
}

interface TravelPost {
  id: string
  userId: string
  username: string
  userAvatar: string
  userBadge?: 'verified' | 'expert' | 'local' | 'frequent'
  content: string
  images: string[]
  location: {
    name: string
    coordinates?: [number, number]
  }
  tags: string[]
  timestamp: Date
  likes: number
  comments: number
  shares: number
  saves: number
  isLiked?: boolean
  isSaved?: boolean
  type: 'experience' | 'tip' | 'review' | 'question' | 'recommendation'
  engagement: {
    totalInteractions: number
    reachScore: number
    trending: boolean
  }
}

interface TravelGroup {
  id: string
  name: string
  description: string
  destination: string
  memberCount: number
  isJoined?: boolean
  image: string
  category: 'general' | 'adventure' | 'budget' | 'luxury' | 'cultural' | 'food' | 'photography' | 'solo'
  recentActivity: string
  createdAt: Date
  privacy: 'public' | 'private'
  moderators: string[]
  rules: string[]
  topicCount: number
  activeMembers: number
}

interface TravelBuddy {
  id: string
  name: string
  avatar: string
  location: string
  age?: number
  gender?: string
  travelStyle: string[]
  languages: string[]
  interests: string[]
  tripDates: { start: string; end: string }
  destination: string
  compatibility?: number
  verified: boolean
  reviews: number
  rating: number
  bio: string
  socialLinks?: {
    instagram?: string
    facebook?: string
  }
  preferences: {
    budgetRange: string
    accommodationType: string[]
    groupSize: number
  }
}

interface Comment {
  id: string
  postId: string
  userId: string
  username: string
  userAvatar: string
  content: string
  timestamp: Date
  likes: number
  isLiked?: boolean
  replies?: Comment[]
}

class CommunityService {
  static async getPosts(filters?: any, pagination?: any): Promise<{posts: TravelPost[], hasMore: boolean}> {
    // Simulated database query with filters and pagination
    const allPosts: TravelPost[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'wanderlust_sarah',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'expert',
        content: 'Just discovered this hidden gem in Penang! The street art scene here is absolutely incredible. This particular mural took my breath away - the way it captures the local culture is just perfect. 🎨✨',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        location: { name: 'George Town, Penang', coordinates: [5.4141, 100.3288] },
        tags: ['streetart', 'penang', 'culture', 'photography'],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        likes: 127,
        comments: 23,
        shares: 8,
        saves: 45,
        type: 'experience',
        engagement: {
          totalInteractions: 203,
          reachScore: 892,
          trending: true
        }
      },
      {
        id: '2',
        userId: 'user2',
        username: 'foodie_explorer',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'local',
        content: 'Pro tip for anyone visiting Jakarta: The best nasi gudeg is NOT in the touristy areas. Head to Jalan Sabang for authentic flavors at half the price. Trust me on this one! 🍛',
        images: ['/api/placeholder/400/300'],
        location: { name: 'Jakarta, Indonesia', coordinates: [-6.2088, 106.8456] },
        tags: ['foodie', 'jakarta', 'local', 'authentic', 'tips'],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        likes: 89,
        comments: 15,
        shares: 12,
        saves: 67,
        type: 'tip',
        engagement: {
          totalInteractions: 183,
          reachScore: 654,
          trending: false
        }
      },
      {
        id: '3',
        userId: 'user3',
        username: 'adventure_mike',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'frequent',
        content: 'Looking for travel buddies for a 10-day Southeast Asia adventure! Planning to hit Thailand, Vietnam, and Cambodia. Who\'s interested in joining? Route details in comments. 🗺️',
        images: [],
        location: { name: 'Southeast Asia' },
        tags: ['travelbuddy', 'adventure', 'backpacking', 'southeastasia', 'thailand', 'vietnam', 'cambodia'],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        likes: 34,
        comments: 28,
        shares: 5,
        saves: 12,
        type: 'question',
        engagement: {
          totalInteractions: 79,
          reachScore: 412,
          trending: false
        }
      },
      {
        id: '4',
        userId: 'user4',
        username: 'luxury_traveler',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'verified',
        content: 'Just finished an amazing week at COMO Shambhala Estate in Bali. The wellness programs here are next level. Perfect for digital detox and reconnecting with nature. Worth every penny! 🧘‍♀️',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300', '/api/placeholder/400/300'],
        location: { name: 'Ubud, Bali', coordinates: [-8.5069, 115.2625] },
        tags: ['luxury', 'wellness', 'bali', 'resort', 'digitaldetox', 'spa'],
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        likes: 156,
        comments: 34,
        shares: 19,
        saves: 78,
        type: 'review',
        engagement: {
          totalInteractions: 287,
          reachScore: 1234,
          trending: true
        }
      },
      {
        id: '5',
        userId: 'user5',
        username: 'budget_nomad',
        userAvatar: '/api/placeholder/40/40',
        content: 'Hostel life in Kuala Lumpur is incredible! Just spent a week at Reggae Mansion for only $8/night. Great community, clean facilities, and perfect location. Met travelers from 12 different countries! 🏠',
        images: ['/api/placeholder/400/300'],
        location: { name: 'Kuala Lumpur, Malaysia', coordinates: [3.1390, 101.6869] },
        tags: ['budget', 'hostel', 'kualalumpur', 'backpacker', 'community', 'affordable'],
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        likes: 92,
        comments: 18,
        shares: 7,
        saves: 43,
        type: 'recommendation',
        engagement: {
          totalInteractions: 160,
          reachScore: 567,
          trending: false
        }
      }
    ]

    // Apply filters
    let filteredPosts = allPosts

    if (filters?.type && filters.type.length > 0) {
      filteredPosts = filteredPosts.filter(post => filters.type.includes(post.type))
    }

    if (filters?.location) {
      filteredPosts = filteredPosts.filter(post => 
        post.location.name.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters?.interests && filters.interests.length > 0) {
      filteredPosts = filteredPosts.filter(post => 
        post.tags.some(tag => filters.interests.some((interest: string) => 
          tag.toLowerCase().includes(interest.toLowerCase())
        ))
      )
    }

    // Apply pagination
    const page = pagination?.page || 1
    const limit = pagination?.limit || 10
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    
    const paginatedPosts = filteredPosts.slice(startIndex, endIndex)
    const hasMore = endIndex < filteredPosts.length

    return { posts: paginatedPosts, hasMore }
  }

  static async getGroups(filters?: any): Promise<TravelGroup[]> {
    const groups: TravelGroup[] = [
      {
        id: '1',
        name: 'Southeast Asia Backpackers',
        description: 'Community for budget travelers exploring Southeast Asia. Share tips, find travel buddies, and discover hidden gems!',
        destination: 'Southeast Asia',
        memberCount: 15420,
        image: '/api/placeholder/100/100',
        category: 'adventure',
        recentActivity: 'New post about Bagan temples 2h ago',
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        privacy: 'public',
        moderators: ['user1', 'user2'],
        rules: ['Be respectful', 'No spam', 'Share authentic experiences'],
        topicCount: 1234,
        activeMembers: 892
      },
      {
        id: '2',
        name: 'Malaysian Food Hunters',
        description: 'Discover the best local eats in Malaysia. From street food to fine dining, we share it all!',
        destination: 'Malaysia',
        memberCount: 8934,
        image: '/api/placeholder/100/100',
        category: 'food',
        recentActivity: '5 new restaurant recommendations today',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
        privacy: 'public',
        moderators: ['user3'],
        rules: ['Share original photos', 'Include location details', 'No promotional posts'],
        topicCount: 567,
        activeMembers: 234
      },
      {
        id: '3',
        name: 'Solo Female Travelers Asia',
        description: 'Safe travels, shared experiences, and lifelong friendships. Join our supportive community!',
        destination: 'Asia',
        memberCount: 12567,
        image: '/api/placeholder/100/100',
        category: 'solo',
        recentActivity: 'Safety tips for Bangkok posted 1h ago',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        privacy: 'public',
        moderators: ['user4', 'user5'],
        rules: ['Women only', 'Support each other', 'Share safety tips'],
        topicCount: 890,
        activeMembers: 456
      },
      {
        id: '4',
        name: 'Luxury Travel Enthusiasts',
        description: 'Exclusive experiences, premium accommodations, and sophisticated travel discussions.',
        destination: 'Global',
        memberCount: 4521,
        image: '/api/placeholder/100/100',
        category: 'luxury',
        recentActivity: 'Private island recommendations shared 3h ago',
        createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000),
        privacy: 'private',
        moderators: ['user6'],
        rules: ['Quality over quantity', 'Verified experiences only', 'Respect privacy'],
        topicCount: 234,
        activeMembers: 123
      }
    ]

    let filteredGroups = groups

    if (filters?.category) {
      filteredGroups = filteredGroups.filter(group => group.category === filters.category)
    }

    if (filters?.destination) {
      filteredGroups = filteredGroups.filter(group => 
        group.destination.toLowerCase().includes(filters.destination.toLowerCase())
      )
    }

    return filteredGroups
  }

  static async getTravelBuddies(filters?: any): Promise<TravelBuddy[]> {
    const buddies: TravelBuddy[] = [
      {
        id: '1',
        name: 'Elena Rodriguez',
        avatar: '/api/placeholder/60/60',
        location: 'Barcelona, Spain',
        age: 28,
        gender: 'female',
        travelStyle: ['Adventure', 'Cultural', 'Photography'],
        languages: ['English', 'Spanish', 'French'],
        interests: ['Street Art', 'Local Food', 'Museums', 'Hiking'],
        tripDates: { start: '2024-01-15', end: '2024-01-25' },
        destination: 'Jakarta, Indonesia',
        compatibility: 92,
        verified: true,
        reviews: 24,
        rating: 4.8,
        bio: 'Passionate photographer and culture enthusiast. Love exploring local neighborhoods and trying authentic cuisine.',
        socialLinks: {
          instagram: '@elena_travels'
        },
        preferences: {
          budgetRange: '$50-100/day',
          accommodationType: ['Boutique Hotels', 'Hostels'],
          groupSize: 2
        }
      },
      {
        id: '2',
        name: 'Alex Chen',
        avatar: '/api/placeholder/60/60',
        location: 'Singapore',
        age: 32,
        gender: 'male',
        travelStyle: ['Budget', 'Local Experience', 'Food'],
        languages: ['English', 'Mandarin', 'Malay'],
        interests: ['Street Food', 'Night Markets', 'Culture', 'Technology'],
        tripDates: { start: '2024-01-18', end: '2024-01-22' },
        destination: 'Kuala Lumpur, Malaysia',
        compatibility: 88,
        verified: true,
        reviews: 18,
        rating: 4.9,
        bio: 'Tech professional who loves exploring Asian cities through food and local experiences.',
        preferences: {
          budgetRange: '$30-60/day',
          accommodationType: ['Hostels', 'Budget Hotels'],
          groupSize: 3
        }
      },
      {
        id: '3',
        name: 'Maya Patel',
        avatar: '/api/placeholder/60/60',
        location: 'Mumbai, India',
        age: 26,
        gender: 'female',
        travelStyle: ['Cultural', 'Spiritual', 'Wellness'],
        languages: ['English', 'Hindi', 'Gujarati'],
        interests: ['Temples', 'Yoga', 'Traditional Arts', 'Meditation'],
        tripDates: { start: '2024-02-01', end: '2024-02-10' },
        destination: 'Bali, Indonesia',
        compatibility: 85,
        verified: true,
        reviews: 31,
        rating: 4.7,
        bio: 'Yoga instructor seeking spiritual and wellness experiences. Love connecting with local traditions.',
        preferences: {
          budgetRange: '$40-80/day',
          accommodationType: ['Wellness Retreats', 'Eco-lodges'],
          groupSize: 2
        }
      }
    ]

    let filteredBuddies = buddies

    if (filters?.destination) {
      filteredBuddies = filteredBuddies.filter(buddy => 
        buddy.destination.toLowerCase().includes(filters.destination.toLowerCase())
      )
    }

    if (filters?.travelStyle && filters.travelStyle.length > 0) {
      filteredBuddies = filteredBuddies.filter(buddy => 
        buddy.travelStyle.some(style => filters.travelStyle.includes(style))
      )
    }

    if (filters?.interests && filters.interests.length > 0) {
      filteredBuddies = filteredBuddies.filter(buddy => 
        buddy.interests.some(interest => filters.interests.includes(interest))
      )
    }

    return filteredBuddies
  }

  static async createPost(userId: string, postData: any): Promise<TravelPost> {
    // Simulate post creation
    const newPost: TravelPost = {
      id: Date.now().toString(),
      userId,
      username: 'current_user',
      userAvatar: '/api/placeholder/40/40',
      content: postData.content,
      images: postData.images || [],
      location: postData.location || { name: 'Unknown' },
      tags: postData.tags || [],
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      type: postData.type || 'experience',
      engagement: {
        totalInteractions: 0,
        reachScore: 0,
        trending: false
      }
    }

    return newPost
  }

  static async likePost(postId: string, userId: string): Promise<{success: boolean, newLikeCount: number}> {
    // Simulate like/unlike
    return {
      success: true,
      newLikeCount: Math.floor(Math.random() * 200) + 1
    }
  }

  static async joinGroup(groupId: string, userId: string): Promise<{success: boolean, newMemberCount: number}> {
    // Simulate join/leave group
    return {
      success: true,
      newMemberCount: Math.floor(Math.random() * 20000) + 1000
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CommunityRequest = await request.json()

    switch (body.action) {
      case 'getPosts':
        const postsResult = await CommunityService.getPosts(body.filters, body.pagination)
        return NextResponse.json({
          success: true,
          data: postsResult,
          meta: {
            page: body.pagination?.page || 1,
            limit: body.pagination?.limit || 10,
            hasMore: postsResult.hasMore
          }
        })

      case 'getGroups':
        const groups = await CommunityService.getGroups(body.filters)
        return NextResponse.json({
          success: true,
          data: groups,
          meta: {
            total: groups.length,
            filtered: true
          }
        })

      case 'getBuddies':
        const buddies = await CommunityService.getTravelBuddies(body.filters)
        return NextResponse.json({
          success: true,
          data: buddies,
          meta: {
            total: buddies.length,
            compatibilityCalculated: true
          }
        })

      case 'createPost':
        if (!body.userId || !body.data) {
          return NextResponse.json(
            { error: 'Missing userId or post data' },
            { status: 400 }
          )
        }
        const newPost = await CommunityService.createPost(body.userId, body.data)
        return NextResponse.json({
          success: true,
          data: newPost
        })

      case 'likePost':
        if (!body.postId || !body.userId) {
          return NextResponse.json(
            { error: 'Missing postId or userId' },
            { status: 400 }
          )
        }
        const likeResult = await CommunityService.likePost(body.postId, body.userId)
        return NextResponse.json({
          success: true,
          data: likeResult
        })

      case 'joinGroup':
        if (!body.groupId || !body.userId) {
          return NextResponse.json(
            { error: 'Missing groupId or userId' },
            { status: 400 }
          )
        }
        const joinResult = await CommunityService.joinGroup(body.groupId, body.userId)
        return NextResponse.json({
          success: true,
          data: joinResult
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Travel Community API error:', error)
    return NextResponse.json(
      { error: 'Failed to process community request' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  if (!action) {
    return NextResponse.json({
      status: 'Travel Community API is operational',
      features: [
        'Social feed with travel posts',
        'Travel group discovery and joining',
        'Travel buddy matching system',
        'Post creation and interaction',
        'Community engagement analytics',
        'Interest-based filtering',
        'Location-based content'
      ],
      endpoints: {
        'POST /': 'Main API endpoint for all community actions',
        'GET /?action=stats': 'Get community statistics',
        'GET /?action=trending': 'Get trending content'
      },
      version: '1.0.0'
    })
  }

  try {
    switch (action) {
      case 'stats':
        return NextResponse.json({
          totalUsers: 45678,
          totalPosts: 12345,
          totalGroups: 234,
          activeBuddyConnections: 567,
          dailyActiveUsers: 2345,
          trendingDestinations: ['Bali', 'Bangkok', 'Kuala Lumpur', 'Singapore', 'Jakarta'],
          popularTags: ['foodie', 'adventure', 'culture', 'budget', 'photography']
        })

      case 'trending':
        const trendingPosts = await CommunityService.getPosts()
        const trending = trendingPosts.posts
          .filter(post => post.engagement.trending)
          .sort((a, b) => b.engagement.reachScore - a.engagement.reachScore)
          .slice(0, 5)
        
        return NextResponse.json({
          success: true,
          data: trending
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Travel Community GET error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
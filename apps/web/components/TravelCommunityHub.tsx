'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Share2, 
  Camera, 
  MapPin, 
  Star, 
  Bookmark,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Globe,
  Calendar,
  UserCheck,
  Eye,
  ThumbsUp,
  Award,
  Flag,
  Send,
  ImageIcon,
  Video,
  Mic,
  X,
  MoreHorizontal,
  Navigation,
  Clock
} from 'lucide-react'

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
  isLiked: boolean
  isSaved: boolean
  type: 'experience' | 'tip' | 'review' | 'question' | 'recommendation'
}

interface TravelGroup {
  id: string
  name: string
  description: string
  destination: string
  memberCount: number
  isJoined: boolean
  image: string
  category: 'general' | 'adventure' | 'budget' | 'luxury' | 'cultural' | 'food'
  recent_activity: string
}

interface TravelBuddy {
  id: string
  name: string
  avatar: string
  location: string
  travelStyle: string[]
  languages: string[]
  interests: string[]
  tripDates: { start: string; end: string }
  destination: string
  compatibility: number
  verified: boolean
  reviews: number
  rating: number
}

interface Comment {
  id: string
  userId: string
  username: string
  userAvatar: string
  content: string
  timestamp: Date
  likes: number
  isLiked: boolean
}

export default function TravelCommunityHub() {
  const [activeTab, setActiveTab] = useState<'feed' | 'groups' | 'buddies' | 'create'>('feed')
  const [posts, setPosts] = useState<TravelPost[]>([])
  const [groups, setGroups] = useState<TravelGroup[]>([])
  const [buddies, setBuddies] = useState<TravelBuddy[]>([])
  const [selectedPost, setSelectedPost] = useState<TravelPost | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [newPost, setNewPost] = useState({ content: '', images: [], location: '', tags: [] })

  // Initialize with sample data
  useEffect(() => {
    generateSampleData()
  }, [])

  const generateSampleData = () => {
    const samplePosts: TravelPost[] = [
      {
        id: '1',
        userId: 'user1',
        username: 'wanderlust_sarah',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'expert',
        content: 'Just discovered this hidden gem in Penang! The street art scene here is absolutely incredible. This particular mural took my breath away - the way it captures the local culture is just perfect. 🎨✨',
        images: ['/api/placeholder/400/300', '/api/placeholder/400/300'],
        location: { name: 'George Town, Penang' },
        tags: ['streetart', 'penang', 'culture', 'photography'],
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 127,
        comments: 23,
        shares: 8,
        saves: 45,
        isLiked: false,
        isSaved: true,
        type: 'experience'
      },
      {
        id: '2',
        userId: 'user2',
        username: 'foodie_explorer',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'local',
        content: 'Pro tip for anyone visiting Jakarta: The best nasi gudeg is NOT in the touristy areas. Head to Jalan Sabang for authentic flavors at half the price. Trust me on this one! 🍛',
        images: ['/api/placeholder/400/300'],
        location: { name: 'Jakarta, Indonesia' },
        tags: ['foodie', 'jakarta', 'local', 'authentic'],
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 89,
        comments: 15,
        shares: 12,
        saves: 67,
        isLiked: true,
        isSaved: false,
        type: 'tip'
      },
      {
        id: '3',
        userId: 'user3',
        username: 'adventure_mike',
        userAvatar: '/api/placeholder/40/40',
        userBadge: 'frequent',
        content: 'Looking for travel buddies for a 10-day Southeast Asia adventure! Planning to hit Thailand, Vietnam, and Cambodia. Who\'s interested in joining? 🗺️',
        images: [],
        location: { name: 'Southeast Asia' },
        tags: ['travelbuddy', 'adventure', 'backpacking', 'southeastasia'],
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        likes: 34,
        comments: 28,
        shares: 5,
        saves: 12,
        isLiked: false,
        isSaved: false,
        type: 'question'
      }
    ]

    const sampleGroups: TravelGroup[] = [
      {
        id: '1',
        name: 'Southeast Asia Backpackers',
        description: 'Community for budget travelers exploring Southeast Asia. Share tips, find travel buddies, and discover hidden gems!',
        destination: 'Southeast Asia',
        memberCount: 15420,
        isJoined: true,
        image: '/api/placeholder/100/100',
        category: 'adventure',
        recent_activity: 'New post about Bagan temples 2h ago'
      },
      {
        id: '2',
        name: 'Malaysian Food Hunters',
        description: 'Discover the best local eats in Malaysia. From street food to fine dining, we share it all!',
        destination: 'Malaysia',
        memberCount: 8934,
        isJoined: false,
        image: '/api/placeholder/100/100',
        category: 'food',
        recent_activity: '5 new restaurant recommendations today'
      },
      {
        id: '3',
        name: 'Solo Female Travelers Asia',
        description: 'Safe travels, shared experiences, and lifelong friendships. Join our supportive community!',
        destination: 'Asia',
        memberCount: 12567,
        isJoined: true,
        image: '/api/placeholder/100/100',
        category: 'general',
        recent_activity: 'Safety tips for Bangkok posted 1h ago'
      }
    ]

    const sampleBuddies: TravelBuddy[] = [
      {
        id: '1',
        name: 'Elena Rodriguez',
        avatar: '/api/placeholder/60/60',
        location: 'Barcelona, Spain',
        travelStyle: ['Adventure', 'Cultural', 'Photography'],
        languages: ['English', 'Spanish', 'French'],
        interests: ['Street Art', 'Local Food', 'Museums'],
        tripDates: { start: '2024-01-15', end: '2024-01-25' },
        destination: 'Jakarta, Indonesia',
        compatibility: 92,
        verified: true,
        reviews: 24,
        rating: 4.8
      },
      {
        id: '2',
        name: 'Alex Chen',
        avatar: '/api/placeholder/60/60',
        location: 'Singapore',
        travelStyle: ['Budget', 'Local Experience', 'Food'],
        languages: ['English', 'Mandarin', 'Malay'],
        interests: ['Street Food', 'Night Markets', 'Culture'],
        tripDates: { start: '2024-01-18', end: '2024-01-22' },
        destination: 'Kuala Lumpur, Malaysia',
        compatibility: 88,
        verified: true,
        reviews: 18,
        rating: 4.9
      },
      {
        id: '3',
        name: 'Maya Patel',
        avatar: '/api/placeholder/60/60',
        location: 'Mumbai, India',
        travelStyle: ['Cultural', 'Spiritual', 'Wellness'],
        languages: ['English', 'Hindi', 'Gujarati'],
        interests: ['Temples', 'Yoga', 'Traditional Arts'],
        tripDates: { start: '2024-02-01', end: '2024-02-10' },
        destination: 'Bali, Indonesia',
        compatibility: 85,
        verified: true,
        reviews: 31,
        rating: 4.7
      }
    ]

    setPosts(samplePosts)
    setGroups(sampleGroups)
    setBuddies(sampleBuddies)
  }

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ))
  }

  const handleSave = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, isSaved: !post.isSaved, saves: post.isSaved ? post.saves - 1 : post.saves + 1 }
        : post
    ))
  }

  const handleJoinGroup = (groupId: string) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, isJoined: !group.isJoined, memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1 }
        : group
    ))
  }

  const openPostDetail = (post: TravelPost) => {
    setSelectedPost(post)
    // Generate sample comments
    const sampleComments: Comment[] = [
      {
        id: '1',
        userId: 'user4',
        username: 'travel_jenny',
        userAvatar: '/api/placeholder/32/32',
        content: 'Amazing shot! Which camera did you use?',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        likes: 5,
        isLiked: false
      },
      {
        id: '2',
        userId: 'user5',
        username: 'marco_adventures',
        userAvatar: '/api/placeholder/32/32',
        content: 'I was there last month! The local artists are so talented.',
        timestamp: new Date(Date.now() - 45 * 60 * 1000),
        likes: 12,
        isLiked: true
      }
    ]
    setComments(sampleComments)
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const getBadgeColor = (badge?: string) => {
    switch (badge) {
      case 'verified': return 'bg-blue-500'
      case 'expert': return 'bg-purple-500'
      case 'local': return 'bg-green-500'
      case 'frequent': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.includes(post.type) ||
                          post.tags.some(tag => selectedFilters.includes(tag))
    
    return matchesSearch && matchesFilters
  })

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Travel Community</h1>
        <p className="text-gray-600 dark:text-gray-300">Connect with fellow travelers, share experiences, and discover new adventures together</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-8">
        {[
          { id: 'feed', name: 'Feed', icon: MessageCircle },
          { id: 'groups', name: 'Groups', icon: Users },
          { id: 'buddies', name: 'Travel Buddies', icon: UserCheck },
          { id: 'create', name: 'Create Post', icon: Plus }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all font-medium ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts, locations, or tags..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['experience', 'tip', 'review', 'question', 'recommendation'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilters(prev => 
                    prev.includes(filter) 
                      ? prev.filter(f => f !== filter)
                      : [...prev, filter]
                  )}
                  className={`px-4 py-2 rounded-full text-sm transition-colors capitalize ${
                    selectedFilters.includes(filter)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Posts Feed */}
          <div className="space-y-6">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={post.userAvatar}
                        alt={post.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{post.username}</h3>
                          {post.userBadge && (
                            <div className={`w-4 h-4 rounded-full ${getBadgeColor(post.userBadge)}`} />
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="w-4 h-4" />
                          <span>{post.location.name}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(post.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <p className="text-gray-900 dark:text-white mb-4">{post.content}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Post Images */}
                {post.images.length > 0 && (
                  <div className={`grid ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-1`}>
                    {post.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Post image ${index + 1}`}
                        className="w-full h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => openPostDetail(post)}
                      />
                    ))}
                  </div>
                )}

                {/* Post Actions */}
                <div className="p-6 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center space-x-2 transition-colors ${
                          post.isLiked ? 'text-red-600' : 'text-gray-600 dark:text-gray-300 hover:text-red-600'
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span className="text-sm">{post.likes}</span>
                      </button>
                      <button
                        onClick={() => openPostDetail(post)}
                        className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-green-600 transition-colors">
                        <Share2 className="w-5 h-5" />
                        <span className="text-sm">{post.shares}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => handleSave(post.id)}
                      className={`transition-colors ${
                        post.isSaved ? 'text-yellow-600' : 'text-gray-600 dark:text-gray-300 hover:text-yellow-600'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.isSaved ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <motion.div
              key={group.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-32 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">{group.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full capitalize ${
                    group.category === 'food' ? 'bg-orange-100 text-orange-600' :
                    group.category === 'adventure' ? 'bg-green-100 text-green-600' :
                    group.category === 'cultural' ? 'bg-purple-100 text-purple-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {group.category}
                  </span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{group.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4" />
                    <span>{group.memberCount.toLocaleString()} members</span>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {group.recent_activity}
                  </div>
                </div>
                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className={`w-full py-2 px-4 rounded-xl transition-colors font-medium ${
                    group.isJoined
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {group.isJoined ? 'Joined' : 'Join Group'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Travel Buddies Tab */}
      {activeTab === 'buddies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {buddies.map((buddy) => (
            <motion.div
              key={buddy.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center space-x-4 mb-4">
                <div className="relative">
                  <img
                    src={buddy.avatar}
                    alt={buddy.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {buddy.verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <UserCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{buddy.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-3 h-3" />
                    <span>{buddy.location}</span>
                  </div>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {buddy.rating} ({buddy.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Travel Style</h4>
                  <div className="flex flex-wrap gap-1">
                    {buddy.travelStyle.map((style, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs rounded-full"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Languages</h4>
                  <div className="flex flex-wrap gap-1">
                    {buddy.languages.map((lang, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs rounded-full"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Trip Details</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center space-x-1 mb-1">
                      <Navigation className="w-3 h-3" />
                      <span>{buddy.destination}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{buddy.tripDates.start} - {buddy.tripDates.end}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{buddy.compatibility}%</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Compatibility</div>
                </div>
                <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                    style={{ width: `${buddy.compatibility}%` }}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <button className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                  Connect
                </button>
                <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Post Tab */}
      {activeTab === 'create' && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Share Your Travel Experience</h2>
            
            <div className="space-y-6">
              <textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="What's your latest travel story? Share tips, experiences, or ask questions..."
                className="w-full h-32 p-4 border border-gray-200 dark:border-gray-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
              />

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <Camera className="w-5 h-5" />
                  <span>Add Photos</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <MapPin className="w-5 h-5" />
                  <span>Add Location</span>
                </button>
              </div>

              <div className="flex justify-end">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium">
                  Share Post
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Post Detail Modal */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedPost.username}'s Post
                  </h3>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto p-6">
                {/* Post content here - similar to feed but with comments */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <img
                        src={comment.userAvatar}
                        alt={comment.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 bg-gray-50 dark:bg-gray-700 rounded-xl p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {comment.username}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTimeAgo(comment.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                  />
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
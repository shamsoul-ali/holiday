'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Upload,
  Download,
  Share2,
  Trash2,
  Eye,
  Lock,
  Unlock,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Bell,
  Smartphone,
  Camera,
  Scan,
  QrCode,
  Folder,
  Star,
  Tag,
  Archive,
  RefreshCw,
  X,
  Edit3,
  Save,
  Copy,
  ExternalLink,
  Paperclip,
  LayoutGrid
} from 'lucide-react'

interface TravelDocument {
  id: string
  type: 'passport' | 'visa' | 'flight' | 'hotel' | 'insurance' | 'vaccine' | 'id' | 'license' | 'other'
  title: string
  description?: string
  fileName: string
  fileSize: number
  mimeType: string
  uploadDate: Date
  expiryDate?: Date
  issueDate?: Date
  issuingAuthority?: string
  documentNumber?: string
  travelerName?: string
  destination?: string
  tags: string[]
  isEncrypted: boolean
  isShared: boolean
  sharedWith?: string[]
  reminders: Array<{
    type: 'expiry' | 'renewal' | 'check'
    date: Date
    message: string
    acknowledged: boolean
  }>
  verification: {
    status: 'verified' | 'pending' | 'invalid' | 'expired'
    lastChecked?: Date
    details?: string
  }
  thumbnail?: string
  category: 'essential' | 'backup' | 'optional'
  accessibility: {
    offlineAccess: boolean
    cloudSync: boolean
    backupCopies: number
  }
}

interface DocumentFolder {
  id: string
  name: string
  description: string
  documentIds: string[]
  color: string
  isProtected: boolean
  tripId?: string
  createdAt: Date
}

const documentTypes = [
  { id: 'passport', name: 'Passport', icon: '🛂', color: 'bg-red-100 text-red-700' },
  { id: 'visa', name: 'Visa', icon: '🎫', color: 'bg-blue-100 text-blue-700' },
  { id: 'flight', name: 'Flight Ticket', icon: '✈️', color: 'bg-sky-100 text-sky-700' },
  { id: 'hotel', name: 'Hotel Booking', icon: '🏨', color: 'bg-purple-100 text-purple-700' },
  { id: 'insurance', name: 'Travel Insurance', icon: '🛡️', color: 'bg-green-100 text-green-700' },
  { id: 'vaccine', name: 'Vaccination', icon: '💉', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'id', name: 'ID Card', icon: '🪪', color: 'bg-gray-100 text-gray-700' },
  { id: 'license', name: 'Driver License', icon: '🚗', color: 'bg-orange-100 text-orange-700' },
  { id: 'other', name: 'Other', icon: '📄', color: 'bg-indigo-100 text-indigo-700' }
]

export default function TravelDocumentManager() {
  const [isOpen, setIsOpen] = useState(false)
  const [documents, setDocuments] = useState<TravelDocument[]>([])
  const [folders, setFolders] = useState<DocumentFolder[]>([])
  const [selectedDocument, setSelectedDocument] = useState<TravelDocument | null>(null)
  const [activeView, setActiveView] = useState<'grid' | 'list' | 'folders'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [newDocument, setNewDocument] = useState<Partial<TravelDocument>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    generateSampleData()
  }, [])

  const generateSampleData = () => {
    const sampleDocuments: TravelDocument[] = [
      {
        id: '1',
        type: 'passport',
        title: 'Malaysian Passport',
        description: 'Primary travel document',
        fileName: 'passport-john-doe.pdf',
        fileSize: 2.4 * 1024 * 1024,
        mimeType: 'application/pdf',
        uploadDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000),
        issueDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000),
        issuingAuthority: 'Immigration Department of Malaysia',
        documentNumber: 'A12345678',
        travelerName: 'John Doe',
        tags: ['passport', 'travel', 'malaysia'],
        isEncrypted: true,
        isShared: false,
        reminders: [
          {
            type: 'expiry',
            date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            message: 'Passport expires in 1 year - consider renewal',
            acknowledged: false
          }
        ],
        verification: {
          status: 'verified',
          lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000),
          details: 'Document verified against government database'
        },
        category: 'essential',
        accessibility: {
          offlineAccess: true,
          cloudSync: true,
          backupCopies: 3
        }
      },
      {
        id: '2',
        type: 'visa',
        title: 'Indonesia Tourist Visa',
        description: 'Entry visa for Jakarta trip',
        fileName: 'indonesia-visa.pdf',
        fileSize: 1.8 * 1024 * 1024,
        mimeType: 'application/pdf',
        uploadDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        issuingAuthority: 'Embassy of Indonesia',
        documentNumber: 'VIS789123',
        travelerName: 'John Doe',
        destination: 'Jakarta, Indonesia',
        tags: ['visa', 'indonesia', 'tourism'],
        isEncrypted: true,
        isShared: false,
        reminders: [],
        verification: {
          status: 'verified',
          lastChecked: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
        category: 'essential',
        accessibility: {
          offlineAccess: true,
          cloudSync: true,
          backupCopies: 2
        }
      },
      {
        id: '3',
        type: 'insurance',
        title: 'Travel Insurance Policy',
        description: 'Comprehensive travel coverage',
        fileName: 'travel-insurance-policy.pdf',
        fileSize: 0.9 * 1024 * 1024,
        mimeType: 'application/pdf',
        uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        issuingAuthority: 'TunePro Insurance',
        documentNumber: 'INS456789',
        travelerName: 'John Doe',
        tags: ['insurance', 'health', 'travel'],
        isEncrypted: false,
        isShared: true,
        sharedWith: ['emergency.contact@email.com'],
        reminders: [],
        verification: {
          status: 'verified',
          lastChecked: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        category: 'essential',
        accessibility: {
          offlineAccess: true,
          cloudSync: true,
          backupCopies: 2
        }
      },
      {
        id: '4',
        type: 'vaccine',
        title: 'COVID-19 Vaccination Certificate',
        description: 'Digital vaccination proof',
        fileName: 'covid-vaccine-cert.pdf',
        fileSize: 0.3 * 1024 * 1024,
        mimeType: 'application/pdf',
        uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        issueDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        issuingAuthority: 'Ministry of Health Malaysia',
        documentNumber: 'VAX123456',
        travelerName: 'John Doe',
        tags: ['vaccine', 'covid', 'health'],
        isEncrypted: false,
        isShared: false,
        reminders: [],
        verification: {
          status: 'verified',
          lastChecked: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        category: 'backup',
        accessibility: {
          offlineAccess: true,
          cloudSync: true,
          backupCopies: 1
        }
      }
    ]

    const sampleFolders: DocumentFolder[] = [
      {
        id: '1',
        name: 'Jakarta Trip 2024',
        description: 'All documents for upcoming Jakarta business trip',
        documentIds: ['1', '2', '3'],
        color: 'bg-blue-500',
        isProtected: true,
        tripId: 'trip-jakarta-2024',
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Health Documents',
        description: 'Medical and vaccination records',
        documentIds: ['4'],
        color: 'bg-green-500',
        isProtected: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    ]

    setDocuments(sampleDocuments)
    setFolders(sampleFolders)
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const getDocumentTypeIcon = (type: string) => {
    return documentTypes.find(t => t.id === type)?.icon || '📄'
  }

  const getDocumentTypeColor = (type: string) => {
    return documentTypes.find(t => t.id === type)?.color || 'bg-gray-100 text-gray-700'
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-600'
      case 'pending': return 'text-yellow-600'
      case 'invalid': return 'text-red-600'
      case 'expired': return 'text-gray-600'
      default: return 'text-gray-600'
    }
  }

  const getVerificationIcon = (status: string) => {
    switch (status) {
      case 'verified': return CheckCircle
      case 'pending': return Clock
      case 'invalid': return AlertTriangle
      case 'expired': return AlertTriangle
      default: return AlertTriangle
    }
  }

  const isDocumentExpiringSoon = (doc: TravelDocument) => {
    if (!doc.expiryDate) return false
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return doc.expiryDate <= thirtyDaysFromNow
  }

  const getPendingReminders = () => {
    return documents.flatMap(doc => 
      doc.reminders.filter(reminder => !reminder.acknowledged)
    )
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.includes(doc.type) ||
                          selectedFilters.includes(doc.category)
    
    return matchesSearch && matchesFilters
  })

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    
    // Simulate upload process
    setTimeout(() => {
      const newDoc: TravelDocument = {
        id: Date.now().toString(),
        type: (newDocument.type as any) || 'other',
        title: newDocument.title || file.name,
        description: newDocument.description,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadDate: new Date(),
        expiryDate: newDocument.expiryDate,
        issueDate: newDocument.issueDate,
        issuingAuthority: newDocument.issuingAuthority,
        documentNumber: newDocument.documentNumber,
        travelerName: newDocument.travelerName,
        destination: newDocument.destination,
        tags: newDocument.tags || [],
        isEncrypted: newDocument.isEncrypted || false,
        isShared: false,
        reminders: [],
        verification: {
          status: 'pending'
        },
        category: (newDocument.category as any) || 'optional',
        accessibility: {
          offlineAccess: true,
          cloudSync: true,
          backupCopies: 1
        }
      }
      
      setDocuments(prev => [newDoc, ...prev])
      setIsUploading(false)
      setShowUploadModal(false)
      setNewDocument({})
    }, 2000)
  }

  const pendingReminders = getPendingReminders()
  const expiringDocuments = documents.filter(isDocumentExpiringSoon)

  return (
    <>
      {/* Floating Document Manager Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-gradient-to-r from-green-600 to-teal-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <FileText className="w-7 h-7 text-white" />
        {(pendingReminders.length > 0 || expiringDocuments.length > 0) && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-xs text-white font-medium">
              {pendingReminders.length + expiringDocuments.length}
            </span>
          </motion.div>
        )}
      </motion.button>

      {/* Main Document Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Manager</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {documents.length} documents • {pendingReminders.length + expiringDocuments.length} alerts
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Add Document</span>
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Alerts Bar */}
              {(pendingReminders.length > 0 || expiringDocuments.length > 0) && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      {expiringDocuments.length > 0 && `${expiringDocuments.length} document(s) expiring soon`}
                      {expiringDocuments.length > 0 && pendingReminders.length > 0 && ' • '}
                      {pendingReminders.length > 0 && `${pendingReminders.length} pending reminder(s)`}
                    </span>
                  </div>
                </div>
              )}

              {/* Search and Controls */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search documents..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                    />
                  </div>
                  
                  {/* View Toggle */}
                  <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                    {[
                      { id: 'grid', name: 'Grid', icon: LayoutGrid },
                      { id: 'list', name: 'List', icon: FileText },
                      { id: 'folders', name: 'Folders', icon: Folder }
                    ].map((view) => (
                      <button
                        key={view.id}
                        onClick={() => setActiveView(view.id as any)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                          activeView === view.id
                            ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                            : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <view.icon className="w-4 h-4" />
                        <span className="hidden sm:inline text-sm">{view.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  {['essential', 'backup', 'passport', 'visa', 'insurance', 'verified', 'expiring'].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setSelectedFilters(prev => 
                        prev.includes(filter) 
                          ? prev.filter(f => f !== filter)
                          : [...prev, filter]
                      )}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors capitalize ${
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

              {/* Content Area */}
              <div className="flex-1 overflow-hidden">
                {activeView === 'grid' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredDocuments.map((doc) => (
                        <motion.div
                          key={doc.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          {/* Document Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getDocumentTypeColor(doc.type)}`}>
                                <span className="text-lg">{getDocumentTypeIcon(doc.type)}</span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-white truncate">{doc.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300 capitalize">{doc.type}</p>
                              </div>
                            </div>
                            {doc.isEncrypted && (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>

                          {/* Document Info */}
                          <div className="space-y-2 mb-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600 dark:text-gray-300">Size:</span>
                              <span className="text-gray-900 dark:text-white">{formatFileSize(doc.fileSize)}</span>
                            </div>
                            {doc.expiryDate && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-300">Expires:</span>
                                <span className={`${isDocumentExpiringSoon(doc) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                                  {formatDate(doc.expiryDate)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Verification Status */}
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const Icon = getVerificationIcon(doc.verification.status)
                                return <Icon className={`w-4 h-4 ${getVerificationColor(doc.verification.status)}`} />
                              })()}
                              <span className={`text-sm ${getVerificationColor(doc.verification.status)} capitalize`}>
                                {doc.verification.status}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              doc.category === 'essential' ? 'bg-red-100 text-red-700' :
                              doc.category === 'backup' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {doc.category}
                            </span>
                          </div>

                          {/* Tags */}
                          {doc.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {doc.tags.slice(0, 3).map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                              {doc.tags.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                                  +{doc.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex justify-between">
                            <div className="flex space-x-1">
                              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                                <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                                <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>
                              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                                <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                              </button>
                            </div>
                            {isDocumentExpiringSoon(doc) && (
                              <div className="flex items-center space-x-1 text-xs text-red-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>Expiring</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeView === 'list' && (
                  <div className="overflow-y-auto h-full">
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => setSelectedDocument(doc)}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getDocumentTypeColor(doc.type)}`}>
                              <span className="text-sm">{getDocumentTypeIcon(doc.type)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">{doc.title}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{doc.description || doc.fileName}</p>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-gray-900 dark:text-white">{formatFileSize(doc.fileSize)}</p>
                              <p className="text-gray-600 dark:text-gray-300">{formatDate(doc.uploadDate)}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const Icon = getVerificationIcon(doc.verification.status)
                                return <Icon className={`w-4 h-4 ${getVerificationColor(doc.verification.status)}`} />
                              })()}
                              {doc.isEncrypted && <Lock className="w-4 h-4 text-gray-400" />}
                              {isDocumentExpiringSoon(doc) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeView === 'folders' && (
                  <div className="p-6 overflow-y-auto h-full">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {folders.map((folder) => (
                        <motion.div
                          key={folder.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className="flex items-center space-x-3 mb-3">
                            <div className={`w-10 h-10 ${folder.color} rounded-lg flex items-center justify-center`}>
                              <Folder className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 dark:text-white truncate">{folder.name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">{folder.documentIds.length} documents</p>
                            </div>
                            {folder.isProtected && (
                              <Lock className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{folder.description}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Created {formatDate(folder.createdAt)}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Add Document</h3>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Type
                    </label>
                    <select
                      value={newDocument.type || ''}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                    >
                      <option value="">Select type...</option>
                      {documentTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={newDocument.title || ''}
                      onChange={(e) => setNewDocument(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Malaysian Passport"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      File Upload
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-600 bg-white dark:bg-gray-800 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowUploadModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUploading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Document Detail Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {selectedDocument.title}
                  </h3>
                  <button
                    onClick={() => setSelectedDocument(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Document Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Type:</span>
                          <span className="text-gray-900 dark:text-white capitalize">{selectedDocument.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Size:</span>
                          <span className="text-gray-900 dark:text-white">{formatFileSize(selectedDocument.fileSize)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-300">Uploaded:</span>
                          <span className="text-gray-900 dark:text-white">{formatDate(selectedDocument.uploadDate)}</span>
                        </div>
                        {selectedDocument.expiryDate && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Expires:</span>
                            <span className={`${isDocumentExpiringSoon(selectedDocument) ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                              {formatDate(selectedDocument.expiryDate)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedDocument.documentNumber && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Document Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-300">Number:</span>
                            <span className="text-gray-900 dark:text-white">{selectedDocument.documentNumber}</span>
                          </div>
                          {selectedDocument.issuingAuthority && (
                            <div className="flex justify-between">
                              <span className="text-gray-600 dark:text-gray-300">Authority:</span>
                              <span className="text-gray-900 dark:text-white">{selectedDocument.issuingAuthority}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Security & Access</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Encrypted:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedDocument.isEncrypted ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Cloud Sync:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedDocument.accessibility.cloudSync ? 'Enabled' : 'Disabled'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Backup Copies:</span>
                          <span className="text-sm text-gray-900 dark:text-white">{selectedDocument.accessibility.backupCopies}</span>
                        </div>
                      </div>
                    </div>

                    {selectedDocument.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedDocument.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between">
                  <div className="flex space-x-2">
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
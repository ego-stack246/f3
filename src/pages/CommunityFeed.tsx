import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Flame, Activity, Award, Target, MoreHorizontal, Check, Users, 
  Trophy, Zap, ChevronRight, X, Sparkles, Heart, MessageCircle, Send, 
  UserPlus, UserCheck, Share2, Image as ImageIcon, Copy, Link2, Mail, ExternalLink
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { cn } from '../lib/utils';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user: {
    id?: string;
    name: string;
    avatar: string;
  };
}

interface Post {
  id: string;
  user: {
    id?: string;
    name: string;
    avatar: string;
    is_following?: boolean;
    is_self?: boolean;
  };
  content: string;
  image_url: string | null;
  likes_count: number;
  shares_count?: number;
  is_liked?: boolean;
  comments_count?: number;
  comments?: Comment[];
  created_at: string;
}

interface Story {
  id: string;
  name: string;
  avatar: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  icon: string;
  participants: number;
  is_joined?: boolean;
  progress?: number;
  days_total?: number;
  reward_points?: number;
  badge?: string;
}

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Math.floor((new Date().getTime() - new Date(isoString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return 'Recently';
  }
}

export default function CommunityFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<Post[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeChallengeModal, setActiveChallengeModal] = useState<Challenge | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // Community Interactions State
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});
  const [activeShareModal, setActiveShareModal] = useState<Post | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);

  // New Post Creation State
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImage, setNewPostImage] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  useEffect(() => {
    apiFetch('/community/feed')
      .then((data: any) => {
        setPosts(data.posts || []);
        setStories(data.stories || []);
        setChallenges(data.challenges || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch feed, using fallback data", err);
        // Fallback mock data if backend isn't up
        setPosts([
          {
            id: "1",
            user: { 
              id: "u-soumya",
              name: "Soumyajit Bhowmik", 
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya",
              is_following: false,
              is_self: false
            },
            content: "Fitness Journey • Just crushed my leg day! The new AI posture coach really helped with my squat depth and keeping knees tracking over toes. Keep pushing everyone! 🏋️‍♂️💪",
            image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop",
            likes_count: 24,
            shares_count: 5,
            is_liked: false,
            comments_count: 2,
            comments: [
              {
                id: "c1",
                content: "Great depth on those squats! Form looked rock solid. 🔥",
                created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
                user: { name: "Priya Sharma", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80" }
              },
              {
                id: "c2",
                content: "Love the dedication Marcus! Let's hit traps and back tomorrow.",
                created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
                user: { name: "Alex Rivera", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80" }
              }
            ],
            created_at: "2026-09-18T10:00:00Z"
          },
          {
            id: "2",
            user: { 
              id: "u-ayan",
              name: "Ayan Mondal", 
              avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan",
              is_following: false,
              is_self: false
            },
            content: "Consistency is key. 5k morning run complete! AI pacing coach had me maintain 5:12/km steady throughout. Who else is doing the 5KM Challenge this week? 🏃‍♀️🔥 #Endurance #Streak",
            image_url: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=800&auto=format&fit=crop",
            likes_count: 18,
            shares_count: 3,
            is_liked: false,
            comments_count: 1,
            comments: [
              {
                id: "c3",
                content: "Pacing on point Priya! Joining you for the 5KM weekend run. 🏃",
                created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
                user: { name: "Marcus Chen", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80" }
              }
            ],
            created_at: "2026-09-19T08:30:00Z"
          }
        ]);
        setStories([
          { id: "s1", name: "Ayan Mondal", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ayan" },
          { id: "s2", name: "Sachin Kumar", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sachin" },
          { id: "s3", name: "Saikat Gorai", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Saikat" },
          { id: "s4", name: "Soumya", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Soumya" }
        ]);
        setChallenges([
          { id: "c1", title: "30 Day Fitness Challenge", description: "Community Challenge", icon: "target", participants: 1204, is_joined: true, progress: 40, days_total: 30, reward_points: 500, badge: "30-Day Master" },
          { id: "c2", title: "5KM Running Challenge", description: "Endurance Goal", icon: "activity", participants: 842, is_joined: false, progress: 0, days_total: 5, reward_points: 350, badge: "Endurance Runner" },
          { id: "c3", title: "7 Day Streak Challenge", description: "Consistency Goal", icon: "award", participants: 2341, is_joined: true, progress: 57, days_total: 7, reward_points: 250, badge: "Streak Pioneer" }
        ]);
        setIsLoading(false);
      });
  }, []);

  // 1. Toggle Like Handler
  const handleToggleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const willBeLiked = !p.is_liked;
      const countDiff = willBeLiked ? 1 : -1;
      return {
        ...p,
        is_liked: willBeLiked,
        likes_count: Math.max(0, p.likes_count + countDiff)
      };
    }));

    try {
      const res: any = await apiFetch(`/community/posts/${postId}/like`, { method: 'POST' });
      if (res && typeof res.likes_count === 'number') {
        setPosts(prev => prev.map(p => p.id === postId ? {
          ...p,
          is_liked: res.is_liked,
          likes_count: res.likes_count
        } : p));
      }
    } catch (err) {
      console.warn("Like sync note:", err);
    }
  };

  // 2. Toggle Follow Handler
  const handleToggleFollow = async (userIdOrName: string) => {
    let willFollow = false;
    setPosts(prev => prev.map(p => {
      const matches = p.user.id === userIdOrName || p.user.name === userIdOrName;
      if (matches) {
        willFollow = !p.user.is_following;
        return {
          ...p,
          user: { ...p.user, is_following: willFollow }
        };
      }
      return p;
    }));

    try {
      const res: any = await apiFetch(`/community/users/${encodeURIComponent(userIdOrName)}/follow`, { method: 'POST' });
      if (res && typeof res.is_following === 'boolean') {
        setPosts(prev => prev.map(p => {
          const matches = p.user.id === userIdOrName || p.user.name === userIdOrName;
          return matches ? { ...p, user: { ...p.user, is_following: res.is_following } } : p;
        }));
      }
    } catch (err) {
      console.warn("Follow sync note:", err);
    }
  };

  // 3. Comments Toggle & Submit Handler
  const toggleComments = (postId: string) => {
    setExpandedComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleSubmitComment = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text || submittingComment[postId]) return;

    setSubmittingComment(prev => ({ ...prev, [postId]: true }));

    // Optimistic comment creation
    const tempId = `temp-${Date.now()}`;
    const newComment: Comment = {
      id: tempId,
      content: text,
      created_at: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name || 'You',
        avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'
      }
    };

    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      const currentComments = p.comments || [];
      return {
        ...p,
        comments_count: (p.comments_count || currentComments.length) + 1,
        comments: [...currentComments, newComment]
      };
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    setExpandedComments(prev => ({ ...prev, [postId]: true }));

    try {
      const res: any = await apiFetch(`/community/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: text })
      });

      if (res && res.id) {
        setPosts(prev => prev.map(p => {
          if (p.id !== postId) return p;
          return {
            ...p,
            comments: (p.comments || []).map(c => c.id === tempId ? {
              ...c,
              id: res.id,
              created_at: res.created_at || c.created_at
            } : c)
          };
        }));
      }
    } catch (err) {
      console.warn("Comment sync note:", err);
    } finally {
      setSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  // 4. Create Post Handler
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || isSubmittingPost) return;
    setIsSubmittingPost(true);

    try {
      const res: any = await apiFetch('/community/posts', {
        method: 'POST',
        body: JSON.stringify({
          content: newPostContent.trim(),
          image_url: newPostImage.trim() || null
        })
      });

      if (res && res.id) {
        setPosts(prev => [res, ...prev]);
      } else {
        // Fallback optimistic post
        const createdPost: Post = {
          id: `post-${Date.now()}`,
          user: {
            id: user?.id,
            name: user?.name || 'You',
            avatar: user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You',
            is_self: true,
            is_following: false
          },
          content: newPostContent.trim(),
          image_url: newPostImage.trim() || null,
          likes_count: 0,
          is_liked: false,
          comments_count: 0,
          comments: [],
          created_at: new Date().toISOString()
        };
        setPosts(prev => [createdPost, ...prev]);
      }

      setNewPostContent('');
      setNewPostImage('');
      setIsCreatingPost(false);
    } catch (err) {
      console.warn("Create post error:", err);
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // 5. Share Handlers
  const handleOpenShare = (post: Post) => {
    setActiveShareModal(post);
    setCopiedLink(false);
    setCopiedQuote(false);
  };

  const handleShareAction = async (channel: 'copy_link' | 'copy_quote' | 'whatsapp' | 'twitter' | 'linkedin' | 'email' | 'native') => {
    if (!activeShareModal) return;

    const post = activeShareModal;
    const shareUrl = `${window.location.origin}/community#post-${post.id}`;
    const shareTitle = `Fitness win by ${post.user.name} on FitSync AI`;
    const shareText = `"${post.content.length > 120 ? post.content.slice(0, 117) + '...' : post.content}" - ${post.user.name} on FitSync AI`;

    // Optimistically increment share count
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, shares_count: (p.shares_count || 0) + 1 } : p));
    setActiveShareModal(prev => prev && prev.id === post.id ? { ...prev, shares_count: (prev.shares_count || 0) + 1 } : prev);

    // Sync share count with backend
    apiFetch(`/community/posts/${post.id}/share`, { method: 'POST' }).catch(() => {});

    if (channel === 'copy_link') {
      navigator.clipboard?.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    } else if (channel === 'copy_quote') {
      navigator.clipboard?.writeText(`${shareText}\n\n${shareUrl}`);
      setCopiedQuote(true);
      setTimeout(() => setCopiedQuote(false), 2200);
    } else if (channel === 'whatsapp') {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else if (channel === 'twitter') {
      const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText}\n`)}&url=${encodeURIComponent(shareUrl)}&hashtags=FitSyncAI,FitnessGoals`;
      window.open(twUrl, '_blank', 'noopener,noreferrer');
    } else if (channel === 'linkedin') {
      const liUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
      window.open(liUrl, '_blank', 'noopener,noreferrer');
    } else if (channel === 'email') {
      const mailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n\nRead more at:\n${shareUrl}`)}`;
      window.location.href = mailUrl;
    } else if (channel === 'native') {
      if (typeof navigator !== 'undefined' && navigator.share) {
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
          });
        } catch {
          // ignore user cancel
        }
      } else {
        navigator.clipboard?.writeText(shareUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2200);
      }
    }
  };

  // 6. Challenge Toggle Handler
  const handleToggleJoin = async (challenge: Challenge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setJoiningId(challenge.id);

    const updatedStatus = !challenge.is_joined;
    const updatedCount = updatedStatus ? challenge.participants + 1 : Math.max(0, challenge.participants - 1);
    const updatedProgress = updatedStatus ? (challenge.progress && challenge.progress > 0 ? challenge.progress : 25) : 0;

    setChallenges(prev => prev.map(c => c.id === challenge.id ? {
      ...c,
      is_joined: updatedStatus,
      participants: updatedCount,
      progress: updatedProgress
    } : c));

    if (activeChallengeModal && activeChallengeModal.id === challenge.id) {
      setActiveChallengeModal({
        ...activeChallengeModal,
        is_joined: updatedStatus,
        participants: updatedCount,
        progress: updatedProgress
      });
    }

    try {
      await apiFetch(`/community/challenges/${challenge.id}/join`, {
        method: 'POST',
      });
    } catch (err) {
      console.warn("Challenge join sync note:", err);
    } finally {
      setJoiningId(null);
    }
  };

  const renderIcon = (iconName: string) => {
    switch(iconName) {
      case 'target': return <Target className="w-5 h-5 text-orange-500" />;
      case 'activity': return <Activity className="w-5 h-5 text-emerald-500" />;
      case 'award': return <Award className="w-5 h-5 text-purple-500" />;
      default: return <Flame className="w-5 h-5 text-orange-500" />;
    }
  };

  const getTagColor = (desc: string) => {
    if (desc.includes('Community')) return 'bg-orange-50 text-orange-700 border-orange-200/60';
    if (desc.includes('Endurance')) return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    return 'bg-purple-50 text-purple-700 border-purple-200/60';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fade-in flex flex-col lg:flex-row gap-8">
      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* Stories Section */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900">Stories</h2>
          <p className="text-slate-500 text-sm mb-6">Recent fitness highlights</p>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {/* Current User Story */}
            <div className="flex flex-col items-center gap-2 min-w-[80px]">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-pink-500 to-orange-400">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-white">
                    <img src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'} alt="You" className="w-full h-full object-cover" />
                  </div>
                </div>
                <button className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 border-2 border-white shadow-sm">
                  <Plus className="w-3 h-3 font-bold" />
                </button>
              </div>
              <span className="text-xs text-slate-600 font-medium">Your Story</span>
            </div>

            {/* Other Users Stories */}
            {stories.map(story => (
              <div key={story.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-orange-400 to-yellow-400">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-slate-100">
                    <img src={story.avatar} alt={story.name} className="w-full h-full object-cover" />
                  </div>
                </div>
                <span className="text-xs text-slate-600 font-medium truncate w-full text-center">{story.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Create Post Box */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-100 transition-all">
          <div className="flex gap-3.5">
            <img 
              src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'} 
              alt="You" 
              className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 object-cover shrink-0" 
            />
            <div className="flex-1 space-y-3">
              <textarea 
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                onFocus={() => setIsCreatingPost(true)}
                rows={isCreatingPost ? 3 : 1}
                placeholder="Share your workout win, posture milestone, or fitness question..." 
                className="w-full bg-slate-50/80 hover:bg-slate-50 focus:bg-white text-sm px-4 py-2.5 rounded-2xl border border-slate-200/80 focus:border-sage-500 focus:outline-none transition-all placeholder-slate-400 resize-none text-slate-800"
              />

              {isCreatingPost && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1 animate-fade-in">
                  <div className="flex items-center gap-2 flex-1">
                    <ImageIcon className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={newPostImage}
                      onChange={(e) => setNewPostImage(e.target.value)}
                      placeholder="Image URL (optional)"
                      className="text-xs bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 flex-1 focus:outline-none focus:border-sage-500 text-slate-700"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingPost(false);
                        setNewPostContent('');
                        setNewPostImage('');
                      }}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-1.5"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || isSubmittingPost}
                      className="bg-sage-600 hover:bg-sage-700 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                    >
                      {isSubmittingPost ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Feed Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Latest from the Community</h2>
            <span className="text-xs font-semibold text-slate-400">{posts.length} posts</span>
          </div>
          
          {isLoading ? (
            <div className="animate-pulse space-y-6">
              {[1, 2].map(i => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-sm h-72 border border-slate-100"></div>
              ))}
            </div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden transition-all duration-200 hover:border-slate-200">
                {/* 1. Post Header with Follow Button */}
                <div className="p-4 sm:p-5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img 
                      src={post.user.avatar} 
                      alt={post.user.name} 
                      className="w-10 h-10 rounded-full bg-slate-100 object-cover ring-2 ring-slate-100/80" 
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm tracking-tight">{post.user.name}</h3>
                        
                        {/* Follow Button */}
                        {post.user.is_self ? (
                          <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                            You
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleFollow(post.user.id || post.user.name)}
                            className={cn(
                              "text-[11px] font-semibold px-2.5 py-0.5 rounded-full transition-all duration-200 flex items-center gap-1 select-none",
                              post.user.is_following
                                ? "bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                                : "bg-sage-100 hover:bg-sage-200 text-sage-800"
                            )}
                          >
                            {post.user.is_following ? (
                              <>
                                <UserCheck className="w-3 h-3 text-sage-600" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-3 h-3 text-sage-600" />
                                <span>Follow</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatTimeAgo(post.created_at)}</p>
                    </div>
                  </div>

                  <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-50 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
                
                {/* 2. Post Media */}
                {post.image_url && (
                  <div className="w-full aspect-video bg-slate-100 relative overflow-hidden">
                    <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
                  </div>
                )}
                
                {/* 3. Post Content */}
                <div className="px-5 py-3">
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{post.content}</p>
                </div>

                {/* 4. Action Bar: Like, Comment, Share */}
                <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between text-slate-600">
                  <div className="flex items-center gap-3 sm:gap-5">
                    {/* Like Button */}
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold group transition-all"
                    >
                      <div className={cn(
                        "p-1.5 rounded-full transition-transform active:scale-125 duration-150",
                        post.is_liked ? "text-rose-500 bg-rose-50" : "text-slate-500 group-hover:text-rose-500 group-hover:bg-rose-50/50"
                      )}>
                        <Heart className={cn("w-4 h-4 transition-colors", post.is_liked && "fill-rose-500 text-rose-500")} />
                      </div>
                      <span className={cn(post.is_liked ? "text-rose-600 font-bold" : "text-slate-600 group-hover:text-slate-900")}>
                        {post.likes_count}
                      </span>
                    </button>

                    {/* Comment Button */}
                    <button
                      onClick={() => toggleComments(post.id)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold transition-all group",
                        expandedComments[post.id] ? "text-sage-700 font-bold" : "text-slate-600 hover:text-slate-900"
                      )}
                    >
                      <div className={cn(
                        "p-1.5 rounded-full transition-colors",
                        expandedComments[post.id] ? "text-sage-700 bg-sage-50" : "text-slate-500 group-hover:text-sage-600 group-hover:bg-sage-50/50"
                      )}>
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span>{post.comments_count || post.comments?.length || 0}</span>
                    </button>

                    {/* Share Button */}
                    <button
                      onClick={() => handleOpenShare(post)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all p-1.5 rounded-full hover:bg-slate-50 group"
                      title="Share post"
                    >
                      <div className="p-1 rounded-full group-hover:bg-slate-100 transition-colors">
                        <Share2 className="w-4 h-4 text-slate-500 group-hover:text-slate-800 transition-colors" />
                      </div>
                      <span>{post.shares_count || 0}</span>
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-slate-400 font-medium">
                    {post.likes_count === 1 ? '1 like' : `${post.likes_count} likes`}
                  </span>
                </div>

                {/* 5. Expandable Comments Thread */}
                {expandedComments[post.id] && (
                  <div className="px-5 pb-4 pt-3 border-t border-slate-100 bg-slate-50/50 space-y-3 animate-fade-in">
                    {/* Comments List */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                            <img
                              src={comment.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user.name}`}
                              alt={comment.user.name}
                              className="w-7 h-7 rounded-full bg-slate-200 shrink-0 mt-0.5 object-cover"
                            />
                            <div className="flex-1 bg-white p-2.5 rounded-2xl border border-slate-100 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
                              <div className="flex items-center justify-between gap-2 mb-0.5">
                                <span className="font-bold text-slate-900">{comment.user.name}</span>
                                <span className="text-[10px] text-slate-400">{formatTimeAgo(comment.created_at)}</span>
                              </div>
                              <p className="text-slate-700 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-2">
                        No comments yet. Be the first to cheer them on!
                      </p>
                    )}

                    {/* Add Comment Input */}
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitComment(post.id);
                      }}
                      className="flex items-center gap-2 pt-1"
                    >
                      <img
                        src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=You'}
                        alt="You"
                        className="w-7 h-7 rounded-full bg-slate-200 shrink-0 object-cover"
                      />
                      <div className="flex-1 relative flex items-center">
                        <input
                          type="text"
                          value={commentInputs[post.id] || ''}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          placeholder="Cheer on their progress or leave advice..."
                          className="w-full bg-white text-xs px-3.5 py-2 pr-9 rounded-full border border-slate-200 focus:border-sage-500 focus:outline-none placeholder-slate-400 text-slate-800"
                        />
                        <button
                          type="submit"
                          disabled={!commentInputs[post.id]?.trim() || submittingComment[post.id]}
                          className="absolute right-1.5 w-6 h-6 rounded-full bg-sage-600 hover:bg-sage-700 disabled:opacity-30 disabled:hover:bg-sage-600 text-white flex items-center justify-center transition-all"
                        >
                          <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

              </div>
            ))
          )}
        </div>

      </div>

      {/* Right Sidebar - Trending Challenges */}
      <div className="lg:w-88 shrink-0">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 sticky top-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900 leading-tight">Trending Challenges</h2>
                <p className="text-xs text-slate-500">Compete & build consistency</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div 
                key={challenge.id} 
                onClick={() => setActiveChallengeModal(challenge)}
                className="group relative p-4 rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 bg-gradient-to-b from-white to-slate-50/50 cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    challenge.icon === 'target' ? 'bg-orange-100/80 text-orange-600' : 
                    challenge.icon === 'activity' ? 'bg-emerald-100/80 text-emerald-600' : 'bg-purple-100/80 text-purple-600'
                  }`}>
                    {renderIcon(challenge.icon)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getTagColor(challenge.description)}`}>
                        {challenge.description}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {challenge.participants.toLocaleString()}
                      </span>
                    </div>

                    <h3 className="font-black text-slate-900 text-sm group-hover:text-sage-600 transition-colors leading-snug truncate">
                      {challenge.title}
                    </h3>

                    {/* Progress Bar if Joined */}
                    {challenge.is_joined && (
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Progress</span>
                          <span className="text-sage-600 font-bold">{Math.round(challenge.progress || 0)}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-sage-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${Math.max(5, challenge.progress || 0)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Bar: Action & Rewards */}
                <div className="mt-3 pt-3 border-t border-slate-100/80 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 font-bold">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>+{challenge.reward_points || 300} pts</span>
                  </div>

                  <button
                    onClick={(e) => handleToggleJoin(challenge, e)}
                    disabled={joiningId === challenge.id}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      challenge.is_joined
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                        : 'bg-slate-900 text-white hover:bg-sage-600 shadow-sm hover:shadow'
                    }`}
                  >
                    {challenge.is_joined ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Joined</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Join</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 p-3 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
              <Zap className="w-4 h-4" />
            </div>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              Complete community challenges to unlock special leaderboard tiers and bonus streak multipliers!
            </p>
          </div>
        </div>
      </div>

      {/* Challenge Detail Modal */}
      {activeChallengeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative animate-scale-up">
            <button 
              onClick={() => setActiveChallengeModal(null)}
              className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                activeChallengeModal.icon === 'target' ? 'bg-orange-100 text-orange-600' : 
                activeChallengeModal.icon === 'activity' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'
              }`}>
                {renderIcon(activeChallengeModal.icon)}
              </div>
              <div>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getTagColor(activeChallengeModal.description)}`}>
                  {activeChallengeModal.description}
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {activeChallengeModal.title}
                </h3>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-6">
              {activeChallengeModal.title === '30 Day Fitness Challenge' && 
                'Commit to 30 days of consistent daily exercise routines. Build long-term habits, elevate cardiovascular endurance, and refine exercise form with real-time AI posture coaching.'}
              {activeChallengeModal.title === '5KM Running Challenge' && 
                'Conquer a 5-kilometer endurance journey at your own pace. Log your strides, track active calorie burn, and push through your endurance thresholds.'}
              {activeChallengeModal.title === '7 Day Streak Challenge' && 
                'Consistency is where transformation begins. Maintain an unbroken 7-day streak with verified AI posture analysis sessions to earn an exclusive streak multiplier.'}
            </p>

            {/* Challenge Rewards & Badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-amber-700">Points Reward</p>
                  <p className="text-sm font-black text-amber-900">+{activeChallengeModal.reward_points || 300} pts</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200/60 flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-purple-700">Badge Unlock</p>
                  <p className="text-sm font-black text-purple-900 truncate">{activeChallengeModal.badge || 'Challenger'}</p>
                </div>
              </div>
            </div>

            {/* Progress Section */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-6 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                <span>Challenge Progress</span>
                <span className="text-sage-600">{Math.round(activeChallengeModal.progress || 0)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-sage-500 to-emerald-500 h-full rounded-full transition-all duration-500" 
                  style={{ width: `${Math.max(5, activeChallengeModal.progress || 0)}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>{activeChallengeModal.participants.toLocaleString()} active challengers</span>
                <span>{activeChallengeModal.days_total || 30} days total</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => handleToggleJoin(activeChallengeModal)}
                className={`flex-1 py-3 px-4 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeChallengeModal.is_joined
                    ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600'
                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/20'
                }`}
              >
                {activeChallengeModal.is_joined ? 'Leave Challenge' : 'Join Challenge Now'}
              </button>

              <button
                onClick={() => {
                  setActiveChallengeModal(null);
                  navigate('/posture');
                }}
                className="py-3 px-5 rounded-2xl font-bold text-sm bg-sage-600 hover:bg-sage-700 text-white shadow-md shadow-sage-600/30 transition-all flex items-center gap-1.5"
              >
                <span>Start Workout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Post Modal */}
      {activeShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative animate-scale-up space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-sage-100 text-sage-700 flex items-center justify-center shadow-sm">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 leading-tight">Share Post</h3>
                  <p className="text-xs text-slate-500">Inspire your network with fitness progress</p>
                </div>
              </div>
              <button
                onClick={() => setActiveShareModal(null)}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Post Mini Preview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3">
              <img
                src={activeShareModal.user.avatar}
                alt={activeShareModal.user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="font-bold text-slate-900 text-xs truncate">{activeShareModal.user.name}</span>
                  <span className="text-[10px] text-slate-400 shrink-0">{formatTimeAgo(activeShareModal.created_at)}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  "{activeShareModal.content}"
                </p>
              </div>
              {activeShareModal.image_url && (
                <img
                  src={activeShareModal.image_url}
                  alt="Thumbnail"
                  className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                />
              )}
            </div>

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Direct Post Link</label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="pl-2 text-slate-400">
                  <Link2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/community#post-${activeShareModal.id}`}
                  className="flex-1 bg-transparent text-xs text-slate-600 outline-none select-all font-mono truncate"
                />
                <button
                  onClick={() => handleShareAction('copy_link')}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm",
                    copiedLink
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  )}
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Share Destinations Grid */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Share to Social & Messaging</label>
              <div className="grid grid-cols-2 gap-2.5">
                {/* WhatsApp */}
                <button
                  onClick={() => handleShareAction('whatsapp')}
                  className="p-3 rounded-2xl border border-emerald-100 hover:border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    WA
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">WhatsApp</p>
                    <p className="text-[10px] text-slate-500">Send to chat</p>
                  </div>
                </button>

                {/* X / Twitter */}
                <button
                  onClick={() => handleShareAction('twitter')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    𝕏
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-slate-700 transition-colors">X / Twitter</p>
                    <p className="text-[10px] text-slate-500">Post update</p>
                  </div>
                </button>

                {/* LinkedIn */}
                <button
                  onClick={() => handleShareAction('linkedin')}
                  className="p-3 rounded-2xl border border-blue-100 hover:border-blue-300 bg-blue-50/50 hover:bg-blue-50 text-blue-800 flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    in
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition-colors">LinkedIn</p>
                    <p className="text-[10px] text-slate-500">Share milestone</p>
                  </div>
                </button>

                {/* Email */}
                <button
                  onClick={() => handleShareAction('email')}
                  className="p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-100 text-slate-800 flex items-center gap-2.5 transition-all text-left group"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-sm">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-slate-700 transition-colors">Email</p>
                    <p className="text-[10px] text-slate-500">Forward link</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => handleShareAction('copy_quote')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl hover:bg-slate-100 transition-all"
              >
                {copiedQuote ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuote ? 'Quote Copied!' : 'Copy Quote Text'}</span>
              </button>

              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={() => handleShareAction('native')}
                  className="text-xs font-bold text-sage-700 hover:text-sage-800 flex items-center gap-1 py-1.5 px-3 rounded-xl hover:bg-sage-50 transition-all"
                >
                  <span>More Options</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

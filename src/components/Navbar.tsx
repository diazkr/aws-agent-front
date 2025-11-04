"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cloud, MessageSquare, Settings, Plus, LogOut, MoreVertical, Trash2, Sparkles, DollarSign } from "lucide-react";
import { useAuth } from "./KeycloakProvider";
import { toast } from "sonner";

interface Conversation {
  conv_id: string;
  title: string;
  last_active: string;
}

const NavItem = ({
  href,
  icon: Icon,
  label,
  isActive,
  expanded,
  onClick
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  expanded: boolean;
  onClick?: () => void;
}) => {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`flex items-center p-2 rounded-xl transition-all duration-300 w-full text-left ${
          isActive
            ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold shadow-lg'
            : 'hover:bg-purple-50 text-gray-700'
        }`}
      >
        <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-purple-600'}`}>
          <Icon size={20} />
        </div>
        {expanded && <span className="ml-3">{label}</span>}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className={`flex items-center p-2 rounded-xl transition-all duration-300 ${
        isActive
          ? 'bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold shadow-lg'
          : 'hover:bg-purple-50 text-gray-700'
      }`}
    >
      <div className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-purple-600'}`}>
        <Icon size={20} />
      </div>
      {expanded && <span className="ml-3">{label}</span>}
    </Link>
  );
};

const NavSection = ({ 
  title, 
  items, 
  expanded, 
  currentPath 
}: { 
  title: string; 
  items: Array<{ href: string; icon: React.ElementType; label: string; onClick?: () => void; }>; 
  expanded: boolean; 
  currentPath: string;
}) => (
  <div>
    {expanded && (
      <p className="text-purple-600 font-semibold text-xs tracking-wider uppercase mb-3">
        {title}
      </p>
    )}
    <nav className="space-y-2">
      {items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          icon={item.icon}
          label={item.label}
          isActive={currentPath === item.href}
          expanded={expanded}
          onClick={item.onClick}
        />
      ))}
    </nav>
  </div>
);

const Navbar = () => {
  const [expanded, setExpanded] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingConvId, setDeletingConvId] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo, logout } = useAuth();

  const fetchConversations = async (userId: string) => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        return;
      }
      const response = await fetch(`${apiBaseUrl}/api/chat/${userId}/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch {
      // Failed to fetch conversations
    }
  };

  useEffect(() => {
    if (userInfo?.username) {
      fetchConversations(userInfo.username);
    }
  }, [userInfo?.username]);

  useEffect(() => {
    const handleNewConversation = () => {
      if (userInfo?.username) {
        fetchConversations(userInfo.username);
      }
    };

    window.addEventListener('conversationCreated', handleNewConversation as EventListener);
    
    return () => {
      window.removeEventListener('conversationCreated', handleNewConversation as EventListener);
    };
  }, [userInfo?.username]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenMenuId(null);
    };

    if (openMenuId) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  const handleNewChat = async () => {
    if (!userInfo?.username) {
      return;
    }

    try {
      const userId = userInfo.username;
      const newChatUrl = `/ai-chat?mode=clean&user_id=${userId}`;
      router.push(newChatUrl);
    } catch {
      // Failed to create new chat
    }
  };

  const handleConversationClick = (conversation: Conversation) => {
    if (!userInfo?.username) {
      return;
    }

    const isGenericTitle = !conversation.title ||
      conversation.title.startsWith('AWS') ||
      conversation.title === 'New Chat';

    const isCleanConversation = !isGenericTitle;
    const modeParam = isCleanConversation ? '&mode=clean' : '';
    const chatUrl = `/ai-chat?user_id=${userInfo.username}&conv_id=${conversation.conv_id}${modeParam}`;

    router.push(chatUrl);
  };

  const handleDeleteConversation = async (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    setDeletingConvId(convId);
    setOpenMenuId(null);

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      if (!apiBaseUrl) {
        toast.error('Configuration error');
        return;
      }

      const response = await fetch(`${apiBaseUrl}/api/chat/${convId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setConversations(prev => prev.filter(conv => conv.conv_id !== convId));

        if (userInfo?.username) {
          await fetchConversations(userInfo.username);
        }

        toast.success('Conversation deleted successfully');
      } else {
        toast.error('Failed to delete conversation');
      }
    } catch {
      toast.error('An error occurred while deleting the conversation');
    } finally {
      setDeletingConvId(null);
    }
  };

  const toggleMenu = (convId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === convId ? null : convId);
  };

  const handleBudgetAnalysis = () => {
    if (!userInfo?.username) {
      return;
    }

    const userId = userInfo.username;
    const budgetUrl = `/ai-chat?user_id=${userId}`;
    router.push(budgetUrl);
  };

  const mainTools = [
    {
      href: "/ai-chat",
      icon: Sparkles,
      label: "Budget Analysis",
      onClick: handleBudgetAnalysis
    }
  ];

  return (
    <div
      className={`bg-white rounded-xl shadow-md py-6 flex flex-col h-full transition-all duration-300 relative ${
        expanded ? "w-[280px]" : "w-[80px]"
      }`}
    >
      <div className="flex-shrink-0 space-y-6 px-3">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl p-3 flex-shrink-0">
            <Cloud className="w-6 h-6 text-white" />
          </div>
          {expanded && (
            <div>
              <h1 className="text-purple-600 font-semibold text-lg">AWS</h1>
              <h2 className="text-purple-600 font-semibold text-lg">CostManager</h2>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -right-3 top-8 bg-purple-400 rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-purple-700 transition-all z-10 border border-white"
            aria-label={expanded ? "Contraer menú" : "Expandir menú"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-white transition-transform duration-300"
              style={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              }}
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        </div>

        <NavSection
          title="Herramientas Principales"
          items={mainTools}
          expanded={expanded}
          currentPath={pathname || ''}
        />

        <div className="mt-8">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 bg-transparent hover:bg-purple-50 font-medium shadow-sm hover:shadow-md ${
              !expanded ? 'px-2' : ''
            }`}
          >
            <Plus size={16} className="flex-shrink-0 text-purple-600" />
            {expanded && (
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                New Cost Chat
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 mt-6 flex flex-col min-h-0">
        {expanded && (
          <p className="px-3 text-purple-600 font-semibold text-xs tracking-wider uppercase mb-3 flex-shrink-0">
            Conversations
          </p>
        )}

        <div className="space-y-2 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent hover:scrollbar-thumb-purple-300">
          {conversations.map((conversation: Conversation) => (
            <div
              key={conversation.conv_id}
              className="relative group"
            >
              <div
                onClick={() => handleConversationClick(conversation)}
                className="cursor-pointer p-2 rounded-xl hover:bg-purple-50 transition-all duration-300 flex items-center"
              >
                {expanded ? (
                  <div className="px-2 flex justify-between items-center w-full">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <MessageSquare size={16} className="text-purple-600 flex-shrink-0" />
                      <div className="ml-2 overflow-hidden flex-1">
                        <p className="text-gray-800 text-sm font-medium truncate">
                          {conversation.title || `AWS Chat ${conversation.conv_id.slice(0, 6)}`}
                        </p>
                        <p className="text-gray-500 text-xs truncate">
                          {new Date(conversation.last_active).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex-shrink-0 ml-2">
                      <button
                        onClick={(e) => toggleMenu(conversation.conv_id, e)}
                        className="p-1 hover:bg-purple-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Menu"
                        disabled={deletingConvId === conversation.conv_id}
                      >
                        <MoreVertical size={16} className="text-gray-600" />
                      </button>

                      {openMenuId === conversation.conv_id && (
                        <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-[150px]">
                          <button
                            onClick={(e) => handleDeleteConversation(conversation.conv_id, e)}
                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            disabled={deletingConvId === conversation.conv_id}
                          >
                            <Trash2 size={14} />
                            {deletingConvId === conversation.conv_id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <MessageSquare size={16} className="text-purple-600 mx-auto" />
                )}
              </div>
            </div>
          ))}

          {conversations.length === 0 && expanded && (
            <p className="text-gray-500 text-sm text-center py-4">
              No hay conversaciones
            </p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 mt-4 space-y-3 px-3">
        <div
          className={`flex items-center ${
            expanded ? "space-x-3" : "justify-center"
          }`}
        >
          <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
            {userInfo?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          {expanded && (
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 truncate">
                {userInfo?.name || userInfo?.username || 'Usuario'}
              </p>
              <p className="text-gray-500 text-sm truncate">
                {userInfo?.email || 'Sin email'}
              </p>
            </div>
          )}
          {expanded && (
            <div className="text-gray-400 flex-shrink-0">
              <Settings size={20} />
            </div>
          )}
        </div>

        <button
          onClick={logout}
          className={`w-full flex items-center justify-center gap-2 p-2 rounded-xl transition-all duration-300 border border-red-200 hover:border-red-400 bg-transparent hover:bg-red-50 text-red-600 font-medium ${
            !expanded ? 'px-2' : ''
          }`}
        >
          <LogOut size={16} className="flex-shrink-0" />
          {expanded && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </div>
  );
};

export default Navbar;

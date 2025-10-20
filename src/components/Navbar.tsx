"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Cloud, MessageSquare, Settings, Plus, LogOut } from "lucide-react";
import { useAuth } from "./KeycloakProvider";

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
  expanded 
}: { 
  href: string; 
  icon: React.ElementType; 
  label: string; 
  isActive: boolean; 
  expanded: boolean;
}) => (
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

// Componente para las secciones del navbar
const NavSection = ({ 
  title, 
  items, 
  expanded, 
  currentPath 
}: { 
  title: string; 
  items: Array<{ href: string; icon: React.ElementType; label: string; }>; 
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
        />
      ))}
    </nav>
  </div>
);

const Navbar = () => {
  const [expanded, setExpanded] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { userInfo, logout } = useAuth();

  // Función para obtener conversaciones
  const fetchConversations = async (userId: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/chat/${userId}/conversations`);
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Efecto para cargar conversaciones al montar el componente
  useEffect(() => {
    fetchConversations("test-15");
  }, []);

  // Función para generar nuevo conversation_id
  const generateConversationId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `conv_${timestamp}_${randomNum}`;
  };

  // Función para crear nueva conversación
  const handleNewChat = () => {
    const newConvId = generateConversationId();
    const userId = "karen-user";
    
    // Navegar dentro de la misma aplicación
    const newChatUrl = `/ai-chat?mode=clean&user_id=${userId}&conv_id=${newConvId}`;
    router.push(newChatUrl);
  };

  // Función para manejar click en conversación
  const handleConversationClick = (conversation: Conversation) => {
    console.log('Clicked conversation:', conversation);
  };

  // Datos de navegación
  const mainTools = [
    {
      href: "/ai-chat",
      icon: MessageSquare,
      label: "AI Chat"
    }
  ];

  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 flex flex-col justify-between h-full transition-all duration-300 relative ${
        expanded ? "w-[280px]" : "w-[80px]"
      }`}
    >
      {/* Header with logo and toggle button */}
      <div className="space-y-6">
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

          {/* Toggle button */}
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

        {/* Main Navigation */}
        <NavSection
          title="Herramientas Principales"
          items={mainTools}
          expanded={expanded}
          currentPath={pathname || ''}
        />

        {/* Status Section */}
        <div className="mt-8">
          {expanded && (
            <p className="text-purple-600 font-semibold text-xs tracking-wider uppercase mb-3">
              Estado Actual
            </p>
          )}

          <div className="space-y-6">
            <div className="flex items-center">
              {expanded ? (
                <>
                  <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                  <p className="text-gray-600 ml-2">AWS Conectado</p>
                </>
              ) : (
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mx-auto"></span>
              )}
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="mt-8">
          <button
            onClick={handleNewChat}
            className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 bg-transparent hover:bg-purple-50 font-medium shadow-sm hover:shadow-md ${
              !expanded ? 'px-2' : ''
            }`}
          >
            <Plus size={16} className="flex-shrink-0 text-purple-600" />
            {expanded && (
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                New Chat
              </span>
            )}
          </button>
        </div>

        {/* Conversations Section */}
        <div className="mt-6">
          {expanded && (
            <p className="text-purple-600 font-semibold text-xs tracking-wider uppercase mb-3">
              Conversations
            </p>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {conversations.map((conversation: Conversation) => (
              <div
                key={conversation.conv_id}
                onClick={() => handleConversationClick(conversation)}
                className="cursor-pointer p-2 rounded-xl hover:bg-purple-50 transition-all duration-300 flex items-center"
              >
                {expanded ? (
                  <>
                    <MessageSquare size={16} className="text-purple-600 flex-shrink-0" />
                    <div className="ml-2 overflow-hidden">
                      <p className="text-gray-800 text-sm font-medium truncate">
                        {conversation.title}
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
                  </>
                ) : (
                  <MessageSquare size={16} className="text-purple-600 mx-auto" />
                )}
              </div>
            ))}
            
            {conversations.length === 0 && expanded && (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay conversaciones
              </p>
            )}
          </div>
        </div>
      </div>

      {/* User Section */}
      <div className="mt-8 space-y-3">
        {/* User Info - Solo se muestra si está autenticado */}
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

        {/* Logout Button */}
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

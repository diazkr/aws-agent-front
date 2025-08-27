"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cloud, AlertTriangle, MessageSquare, Settings } from "lucide-react";

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

  // Función para manejar click en conversación
  const handleConversationClick = (conversation: Conversation) => {
    console.log('Clicked conversation:', conversation);
  };

  // Datos de navegación
  const mainTools = [
    {
      href: "/review-overcost",
      icon: AlertTriangle,
      label: "Review Overcost"
    },
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

        {/* Conversations Section */}
        <div className="mt-8">
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
      <div
        className={`flex items-center mt-8 ${
          expanded ? "space-x-3" : "justify-center"
        }`}
      >
        <div className="bg-purple-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
          K
        </div>
        {expanded && (
          <div>
            <p className="font-medium text-gray-800">Karen Diaz</p>
            <p className="text-gray-500 text-sm">Administrador AWS</p>
          </div>
        )}
        {expanded && (
          <div className="ml-auto text-gray-400">
            <Settings size={20} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;

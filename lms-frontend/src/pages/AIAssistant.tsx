import { useState, useRef, useEffect } from "react";
import { Icons } from "../components/ui";
import { useApi } from "../hooks/useApi";
import {
  aiApi,
  coursesApi,
  slidesApi,
  type ApiCourse,
  type ApiSlide,
} from "../services/api";

import ReactMarkdown from "react-markdown";

interface AIAssistantProps {
  initialCourseId?: string;
  initialLectureId?: string;
  initialScope?: string;
}

type Scope =
  | {
      type: "course";
      courseId: string;
      courseTitle?: string;
    }
  | {
      type: "lecture";
      courseId: string;
      lectureId: string;
      courseTitle?: string;
      lectureTitle?: string;
    };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  scope?: Scope;
}

/* -------------------------------------------------------------------------- */
/* Course Scope Item                                                          */
/* -------------------------------------------------------------------------- */

function CourseScopeItem({
  course,
  scope,
  onChangeScope,
  expandedCourseId,
  setExpandedCourseId,
}: {
  course: ApiCourse;
  scope: Scope;
  onChangeScope: (s: Scope) => void;
  expandedCourseId: string | null;
  setExpandedCourseId: (id: string | null) => void;
}) {
  const { data: lectures } = useApi(
    () => slidesApi.byCourse(course.id),
    [course.id]
  );

  const courseLectures = lectures ?? [];
  const courseId = String(course.id);
  const isExpanded = expandedCourseId === courseId;

  return (
    <div>
      <div className="flex items-center">
        {/* COURSE */}
        <button
          className="flex-1 flex items-center gap-3 px-3 py-2.5 hover:bg-[#F4F6FA] text-left transition-colors"
          onClick={() => {
            onChangeScope({
              type: "course",
              courseId,
              courseTitle: course.Name,
            });

            setExpandedCourseId(null);
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "#1C3D6E" }}
          >
            {course.Name.charAt(0)}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-[#0D1B2E] truncate">
              {course.Name}
            </p>

            <p className="text-xs text-[#9BAABF]">
              Entire course · {courseLectures.length} slides
            </p>
          </div>

          {scope.type === "course" &&
            scope.courseId === courseId && (
              <span className="ml-auto text-[#1C3D6E] flex-shrink-0">
                <Icons.Check />
              </span>
            )}
        </button>

        {/* EXPAND SLIDES */}
        <button
          className="w-9 h-full flex items-center justify-center text-[#9BAABF] hover:text-[#1C3D6E] hover:bg-[#EEF2F8] transition-colors flex-shrink-0 self-stretch"
          onClick={() =>
            setExpandedCourseId(
              isExpanded ? null : courseId
            )
          }
          title={
            isExpanded ? "Hide slides" : "Show slides"
          }
        >
          <span
            className={`transition-transform duration-150 ${
              isExpanded ? "rotate-180" : ""
            }`}
          >
            <Icons.ChevronDown />
          </span>
        </button>
      </div>

      {/* SLIDES */}
      {isExpanded && (
        <div className="border-t border-[#F0F4F8] bg-[#FAFBFD]">
          {courseLectures.map((lecture: ApiSlide) => {
            const lectureId = String(lecture.id);

            const isSelected =
              scope.type === "lecture" &&
              scope.courseId === courseId &&
              scope.lectureId === lectureId;

            return (
              <button
                key={lecture.id}
                className={`w-full flex items-center gap-3 pl-10 pr-3 py-2 text-left transition-colors ${
                  isSelected
                    ? "bg-[#EEF2F8]"
                    : "hover:bg-[#F4F6FA]"
                }`}
                onClick={() => {
                  onChangeScope({
                    type: "lecture",
                    courseId,
                    lectureId,
                    courseTitle: course.Name,
                    lectureTitle: lecture.name,
                  });

                  setExpandedCourseId(null);
                }}
              >
                <span className="flex-shrink-0 text-[#9BAABF]">
                  <Icons.PDF />
                </span>

                <span className="text-xs text-[#3A4A5E] flex-1 truncate">
                  {lecture.name}
                </span>

                {isSelected && (
                  <span className="text-[#1C3D6E] flex-shrink-0">
                    <Icons.Check />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Scope Indicator                                                            */
/* -------------------------------------------------------------------------- */

function ScopeIndicator({
  scope,
  courses,
  onChangeScope,
}: {
  scope: Scope;
  courses: ApiCourse[];
  onChangeScope: (s: Scope) => void;
}) {
  const [open, setOpen] = useState(false);

  const [expandedCourseId, setExpandedCourseId] =
    useState<string | null>(scope.courseId);

  const course = courses.find(
    (c) => String(c.id) === scope.courseId
  );

  const label =
    scope.type === "lecture"
      ? scope.lectureTitle ?? "Lecture"
      : scope.courseTitle ??
        course?.Name ??
        "Course";

  const icon =
    scope.type === "lecture" ? (
      <Icons.PDF />
    ) : (
      <Icons.Courses />
    );

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EEF2F8] hover:bg-[#DDE6F5] transition-colors text-sm font-medium text-[#1C3D6E]"
      >
        <span className="text-[#1C3D6E] flex items-center">
          {icon}
        </span>

        <span className="max-w-[200px] truncate">
          {label}
        </span>

        <Icons.ChevronDown />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />

          <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-xl border border-[#DEE5F0] shadow-lg w-80 py-1.5 overflow-hidden max-h-[420px] overflow-y-auto">
            <div className="px-3 py-2 text-xs font-semibold text-[#9BAABF] uppercase tracking-wider sticky top-0 bg-white border-b border-[#DEE5F0]">
              Ask about…
            </div>

            {/* COURSES */}
            {courses.slice(0, 4).map((course) => (
              <CourseScopeItem
                key={course.id}
                course={course}
                scope={scope}
                onChangeScope={(s) => {
                  onChangeScope(s);
                  setOpen(false);
                }}
                expandedCourseId={expandedCourseId}
                setExpandedCourseId={
                  setExpandedCourseId
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Message Bubble                                                             */
/* -------------------------------------------------------------------------- */

 function MessageBubble({
  message,
}: {
  message: Message;
}) {
  const isUser = message.role === "user";

  /* ---------------------------------------------------------------------- */
  /* USER MESSAGE                                                           */
  /* ---------------------------------------------------------------------- */

  if (isUser) {
    return (
      <div className="flex justify-end mb-4">
        <div className="max-w-[80%] bg-[#1C3D6E] text-white rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* AI MESSAGE                                                             */
  /* ---------------------------------------------------------------------- */

  return (
    <div className="flex gap-3 mb-5">
      {/* AI icon */}
      <div className="w-7 h-7 rounded-full bg-[#1C3D6E]/10 flex items-center justify-center text-[#1C3D6E] flex-shrink-0 mt-0.5">
        <Icons.Sparkle />
      </div>

      <div className="flex-1 min-w-0">
        {/* AI name */}
        <p className="text-xs font-medium text-[#5A6A82] mb-1.5">
          AI Assistant
        </p>

        {/* AI response */}
        <div className="bg-white border border-[#DEE5F0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
          <div className="text-sm text-[#3A4A5E] leading-relaxed">
            <ReactMarkdown
              components={{
                /* Paragraph */
                p: ({ children }) => (
                  <p className="mb-3 last:mb-0">
                    {children}
                  </p>
                ),

                /* Bold */
                strong: ({ children }) => (
                  <strong className="font-semibold text-[#0D1B2E]">
                    {children}
                  </strong>
                ),

                /* Italic */
                em: ({ children }) => (
                  <em className="italic">
                    {children}
                  </em>
                ),

                /* Unordered list */
                ul: ({ children }) => (
                  <ul className="list-disc pl-5 mb-3 space-y-1">
                    {children}
                  </ul>
                ),

                /* Ordered list */
                ol: ({ children }) => (
                  <ol className="list-decimal pl-5 mb-3 space-y-1">
                    {children}
                  </ol>
                ),

                /* List item */
                li: ({ children }) => (
                  <li className="leading-relaxed">
                    {children}
                  </li>
                ),

                /* H1 */
                h1: ({ children }) => (
                  <h1 className="text-lg font-bold text-[#0D1B2E] mb-3">
                    {children}
                  </h1>
                ),

                /* H2 */
                h2: ({ children }) => (
                  <h2 className="text-base font-bold text-[#0D1B2E] mb-2">
                    {children}
                  </h2>
                ),

                /* H3 */
                h3: ({ children }) => (
                  <h3 className="text-sm font-bold text-[#0D1B2E] mb-2">
                    {children}
                  </h3>
                ),

                /* Inline code */
                code: ({ children }) => (
                  <code className="bg-[#F4F6FA] px-1.5 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                ),

                /* Blockquote */
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-[#1C3D6E]/30 pl-3 my-3 text-[#5A6A82]">
                    {children}
                  </blockquote>
                ),

                /* Horizontal line */
                hr: () => (
                  <hr className="my-4 border-[#DEE5F0]" />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Timestamp */}
        <p className="text-xs text-[#9BAABF] mt-1.5">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Typing Indicator                                                           */
/* -------------------------------------------------------------------------- */

function TypingIndicator() {
  return (
    <div className="flex gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-[#1C3D6E]/10 flex items-center justify-center text-[#1C3D6E] flex-shrink-0">
        <Icons.Sparkle />
      </div>

      <div className="bg-white border border-[#DEE5F0] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#9BAABF]"
              style={{
                animation: `bounce 1.2s ease-in-out ${
                  i * 0.2
                }s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main AI Assistant                                                          */
/* -------------------------------------------------------------------------- */

export default function AIAssistant({
  initialCourseId,
  initialLectureId,
}: AIAssistantProps) {
  const { data: coursesData } = useApi(
    () => coursesApi.list(),
    []
  );

  const courses: ApiCourse[] = coursesData ?? [];

  /* ---------------------------------------------------------------------- */
  /* Initial scope                                                          */
  /* ---------------------------------------------------------------------- */

  const initialScopeState: Scope =
    initialLectureId && initialCourseId
      ? {
          type: "lecture",
          courseId: initialCourseId,
          lectureId: initialLectureId,
        }
      : {
          type: "course",
          courseId: initialCourseId ?? String(
            courses[0]?.id ?? ""
          ),
        };

  const [scope, setScope] =
    useState<Scope>(initialScopeState);

  /* ---------------------------------------------------------------------- */
  /* Messages                                                               */
  /* ---------------------------------------------------------------------- */

  const [messages, setMessages] =
    useState<Message[]>([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! Ask me anything about your course materials.",
        timestamp: new Date(),
      },
    ]);

  /*
   * One conversation ID stays the same while chatting.
   * New chat creates a new conversation ID.
   */
  const [conversationId, setConversationId] =
    useState(() => Date.now());

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const inputRef =
    useRef<HTMLTextAreaElement>(null);

  /* ---------------------------------------------------------------------- */
  /* Scroll                                                                  */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  /* ---------------------------------------------------------------------- */
  /* Scope banner                                                           */
  /* ---------------------------------------------------------------------- */

  const getScopeBanner = () => {
    const course = courses.find(
      (c) => String(c.id) === scope.courseId
    );

    if (scope.type === "lecture") {
      return {
        label: `Answering from: ${
          scope.lectureTitle ??
          course?.Name ??
          "Lecture"
        }`,
        color: "#E07B39",
      };
    }

    return {
      label: `Answering from: ${
        scope.courseTitle ??
        course?.Name ??
        "Course"
      }`,
      color: "#1C3D6E",
    };
  };

  const banner = getScopeBanner();

  /* ---------------------------------------------------------------------- */
  /* Send message                                                           */
  /* ---------------------------------------------------------------------- */

  const sendMessage = async (text?: string) => {
    const msg = (text ?? input).trim();

    if (!msg || isLoading) {
      return;
    }

    setInput("");

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: msg,
      timestamp: new Date(),
      scope,
    };

    setMessages((prev) => [
      ...prev,
      userMsg,
    ]);

    setIsLoading(true);

    try {
      /*
       * IMPORTANT:
       *
       * Course:
       * question + course_id + conversation_id
       *
       * Lecture:
       * question + course_id + slide_id + conversation_id
       */

      const payload: Parameters<
        typeof aiApi.query
      >[0] = {
        question: msg,
        course_id: Number(scope.courseId),
        conversation_id: conversationId,

        /*
         * Your AiQueryPayload currently requires slide_id.
         *
         * We don't put it here because a course question
         * does NOT have a slide.
         */
      };

      /* Only lecture questions receive slide_id */
      if (scope.type === "lecture") {
        payload.slide_id = Number(
          scope.lectureId
        );
      }

      const res = await aiApi.query(payload);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.answer,
        timestamp: new Date(),
        scope,
      };

      setMessages((prev) => [
        ...prev,
        aiMsg,
      ]);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Please try again.";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Something went wrong.\n\n${errorMessage}`,
        timestamp: new Date(),
        scope,
      };

      setMessages((prev) => [
        ...prev,
        aiMsg,
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------------------------------------------------------------- */
  /* Enter key                                                              */
  /* ---------------------------------------------------------------------- */

  const handleKeyDown = (
    e: React.KeyboardEvent
  ) => {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* ---------------------------------------------------------------------- */
  /* New conversation                                                       */
  /* ---------------------------------------------------------------------- */

  const clearConversation = () => {
    /*
     * Generate a NEW conversation ID.
     */
    setConversationId(Date.now());

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! Ask me anything about your course materials.",
        timestamp: new Date(),
      },
    ]);

    setInput("");
  };

  /* ---------------------------------------------------------------------- */
  /* UI                                                                      */
  /* ---------------------------------------------------------------------- */

  return (
    <div
      className="flex flex-col h-full"
      style={{
        height: "calc(100vh - 0px)",
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-[#DEE5F0] px-5 py-4 flex items-center gap-3 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#1C3D6E]/10 flex items-center justify-center text-[#1C3D6E]">
          <Icons.Sparkle />
        </div>

        <div className="flex-1">
          <h1 className="text-sm font-semibold text-[#0D1B2E]">
            AI Assistant
          </h1>

          <p className="text-xs text-[#5A6A82]">
            Powered by your course materials
          </p>
        </div>

        <button
          onClick={clearConversation}
          className="text-xs font-medium text-[#5A6A82] hover:text-[#1C3D6E] transition-colors px-2 py-1 rounded hover:bg-[#EEF2F8]"
        >
          New chat
        </button>
      </div>

      {/* Scope selector */}
      <div className="bg-[#F8FAFB] border-b border-[#DEE5F0] px-5 py-2.5 flex items-center gap-3 flex-shrink-0">
        <span className="text-xs text-[#9BAABF] font-medium">
          Context:
        </span>

        <ScopeIndicator
          scope={scope}
          courses={courses}
          onChangeScope={setScope}
        />

        {banner && (
          <div className="flex items-center gap-1.5 ml-2">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: banner.color,
              }}
            />

            <span className="text-xs text-[#5A6A82]">
              {banner.label}
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
            />
          ))}

          {isLoading && (
            <TypingIndicator />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-[#DEE5F0] px-4 py-4 sm:px-6 flex-shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder={
                  scope.type === "lecture"
                    ? "Ask about this lecture…"
                    : "Ask about this course…"
                }
                rows={1}
                className="w-full rounded-xl border border-[#DEE5F0] bg-[#F8FAFB] px-4 py-3 text-sm text-[#0D1B2E] placeholder-[#9BAABF] focus:outline-none focus:ring-2 focus:ring-[#1C3D6E]/20 focus:border-[#1C3D6E] transition-all resize-none"
                style={{
                  minHeight: "44px",
                  maxHeight: "120px",
                }}
                onInput={(e) => {
                  const textarea =
                    e.currentTarget;

                  textarea.style.height =
                    "auto";

                  textarea.style.height =
                    Math.min(
                      textarea.scrollHeight,
                      120
                    ) + "px";
                }}
                disabled={isLoading}
              />
            </div>

            <button
              onClick={() => sendMessage()}
              disabled={
                !input.trim() ||
                isLoading
              }
              className="w-10 h-10 rounded-xl bg-[#1C3D6E] text-white flex items-center justify-center hover:bg-[#162f55] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
            >
              <Icons.Send />
            </button>
          </div>

          <p className="text-xs text-[#9BAABF] mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.4;
          }

          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
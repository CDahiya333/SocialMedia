import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState, useEffect } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import useAuth from "../../hooks/useAuth";
import EmojiPicker from "emoji-picker-react";
import { useTheme } from "../../context/ThemeContext";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const imgRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const { isDark } = useTheme();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: authUser } = useAuth();
  const queryClient = useQueryClient();

  const {
    mutate: createPost,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ text, img }) => {
      try {
        const formData = new FormData();
        formData.append("text", text || "");

        if (img) {
          formData.append("img", img);
        }

        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/posts/create`,
          {
            method: "POST",
            body: formData,
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }
        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },

    onSuccess: () => {
      setText("");
      setImg(null);
      setPreview(null);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImg(file);
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
    }
  };

  const onEmojiClick = (emojiObject) => {
    const cursor = document.querySelector('textarea').selectionStart;
    const textBeforeCursor = text.slice(0, cursor);
    const textAfterCursor = text.slice(cursor);
    setText(textBeforeCursor + emojiObject.emoji + textAfterCursor);
    setShowEmojiPicker(false);
  };

  if (!authUser) return null;

  return (
    <div className="flex p-4 items-start gap-4 border-b border-border-light dark:border-border-dark">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img
            src={authUser?.profileImg || "/avatar-placeholder.png"}
            alt="User avatar"
          />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full relative" onSubmit={handleSubmit}>
        <textarea
          className="w-full p-0 text-lg resize-none bg-transparent theme-text-primary placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark focus:outline-none"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {preview && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-black/50 dark:bg-white/20 rounded-full w-5 h-5 cursor-pointer"
              onClick={() => {
                setImg(null);
                setPreview(null);
                if (imgRef.current) imgRef.current.value = null;
              }}
            />
            <img
              src={preview}
              alt="Preview"
              className="w-full mx-auto h-62 object-contain rounded"
            />
          </div>
        )}
        <div className="flex justify-between border-t py-1 border-border-light dark:border-border-dark">
          <div className="flex gap-2 items-center relative">
            <CiImageOn
              className="text-primary-light dark:text-primary-dark w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <div className="relative" ref={emojiPickerRef}>
              <BsEmojiSmileFill 
                className="text-primary-light dark:text-primary-dark w-5 h-5 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              />
              {showEmojiPicker && (
                <div className="absolute top-8 left-0 z-50 shadow-lg rounded-xl overflow-hidden bg-surface-light dark:bg-surface-dark border border-border-light dark:border-border-dark">
                  <EmojiPicker
                    theme={isDark ? 'dark' : 'light'}
                    onEmojiClick={onEmojiClick}
                    width={300}
                    height={400}
                    searchDisabled
                    skinTonesDisabled
                    previewConfig={{
                      showPreview: false
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange}
          />
          <button className="theme-button-primary px-4 py-1 rounded-full text-sm">
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-500">{error.message}</div>}
      </form>
    </div>
  );
};

export default CreatePost;

import { CiImageOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { useRef, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const CreatePost = () => {
  const [text, setText] = useState("");
  const [img, setImg] = useState(null);
  const [preview, setPreview] = useState(null);
  const imgRef = useRef(null);

  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
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
        formData.append("text", text || ""); // Ensure text is not undefined

        if (img) {
          formData.append("img", img); // Append file directly
        }

        const res = await fetch("/api/posts/create", {
          method: "POST",
          body: formData,
        });

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

    console.log("Submitting Post:");
    console.log("Text:", text);
    console.log("Image:", img);

    createPost({ text, img });
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      console.log("Selected file:", file); // Debugging
      setImg(file); // Store File directly
      const previewUrl = URL.createObjectURL(file);
      console.log("Generated preview URL:", previewUrl);
      setPreview(previewUrl);
    }
  };

  return (
    // Post Skeleton: Avatar -- Placeholder
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          <img src={authUser.profileImg || "/avatar-placeholder.png"} />
        </div>
      </div>
      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full p-0 text-lg resize-none border-none focus:outline-none  border-gray-800"
          placeholder="What is happening?!"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        {/* Image Preview */}
        {preview && (
          <div className="relative w-72 mx-auto">
            <IoCloseSharp
              className="absolute top-0 right-0 text-white bg-gray-800 rounded-full w-5 h-5 cursor-pointer"
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
        {/* Reference to File Upload */}
        <div className="flex justify-between border-t py-1 border-t-gray-700">
          {/* Gallery & Emoji Icon */}
          <div className="flex gap-2 items-center">
            <CiImageOn
              className="fill-primary w-6 h-6 cursor-pointer"
              onClick={() => imgRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary w-5 h-5 cursor-pointer" />
          </div>
          {/* File Upload Box */}
          <input
            type="file"
            accept="image/*"
            hidden
            ref={imgRef}
            onChange={handleImgChange} // Uses updated function
          />
          <button className="btn btn-primary rounded-full btn-sm text-white px-4">
            {isPending ? "Posting..." : "Post"}
          </button>
        </div>
        {isError && <div className="text-red-500">{error.message}</div>}
      </form>
    </div>
  );
};
export default CreatePost;

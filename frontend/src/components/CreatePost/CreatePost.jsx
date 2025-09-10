import React, { useState } from "react";
import {
  Avatar,
  Backdrop,
  Box,
  Button,
  CircularProgress,
  IconButton,
  Modal,
  TextField,
  Typography,
  Chip
} from "@mui/material";
import { useFormik } from "formik";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import DescriptionIcon from "@mui/icons-material/Description";
import CloseIcon from "@mui/icons-material/Close";

import { useDispatch, useSelector } from "react-redux";
import { createPostAction } from "../../Redux/Post/post.action";
import { UploadToCloudinary } from "../../Utils/UploadToCloudinary";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90vw", sm: 500 },
  maxHeight: "90vh",
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 3,
  borderRadius: 2,
  outline: "none",
  overflowY: "auto",
};

const CreatePost = ({ open, handleClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { auth } = useSelector(store => store);

  // Unified file selection handler
  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = {
      image: ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"],
      video: ["video/mp4", "video/mov", "video/avi", "video/mkv", "video/webm"],
      docs: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "application/zip",
        "application/x-rar-compressed"
      ]
    };

    const typeCategory = file.type.startsWith("image")
      ? "image"
      : file.type.startsWith("video")
      ? "video"
      : allowedTypes.docs.includes(file.type)
      ? "docs"
      : null;

    if (!typeCategory) {
      setError("Invalid file type. Please upload image, video, or document.");
      return;
    }

    const sizeLimit = typeCategory === "image" ? 10 : typeCategory === "video" ? 100 : 20; // MB
    if (file.size > sizeLimit * 1024 * 1024) {
      setError(`${typeCategory} size must be less than ${sizeLimit}MB`);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const url = await UploadToCloudinary(file, typeCategory);

      if (typeCategory === "image") {
        setSelectedImage(url);
        formik.setFieldValue("image", url);
        formik.setFieldValue("imageName", file.name); // Add filename
        setSelectedVideo(null);
        setSelectedDoc(null);
        formik.setFieldValue("video", "");
        formik.setFieldValue("videoName", "");
        formik.setFieldValue("document", "");
        formik.setFieldValue("documentName", "");
      } else if (typeCategory === "video") {
        setSelectedVideo(url);
        formik.setFieldValue("video", url);
        formik.setFieldValue("videoName", file.name); // Add filename
        setSelectedImage(null);
        setSelectedDoc(null);
        formik.setFieldValue("image", "");
        formik.setFieldValue("imageName", "");
        formik.setFieldValue("document", "");
        formik.setFieldValue("documentName", "");
      } else {
        setSelectedDoc({
          url,
          name: file.name,
          type: file.type
        });
        formik.setFieldValue("document", url);
        formik.setFieldValue("documentName", file.name); // Add filename
        setSelectedImage(null);
        setSelectedVideo(null);
        formik.setFieldValue("image", "");
        formik.setFieldValue("imageName", "");
        formik.setFieldValue("video", "");
        formik.setFieldValue("videoName", "");
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleRemoveMedia = (type) => {
    if (type === "image") {
      setSelectedImage(null);
      formik.setFieldValue("image", "");
      formik.setFieldValue("imageName", "");
    } else if (type === "video") {
      setSelectedVideo(null);
      formik.setFieldValue("video", "");
      formik.setFieldValue("videoName", "");
    } else {
      setSelectedDoc(null);
      formik.setFieldValue("document", "");
      formik.setFieldValue("documentName", "");
    }
  };

  const getFileIcon = (type) => {
    if (type.includes("word")) return "📝";
    if (type.includes("pdf")) return "📄";
    if (type.includes("powerpoint") || type.includes("presentation")) return "📊";
    if (type.includes("excel") || type.includes("spreadsheet")) return "📈";
    if (type.includes("zip") || type.includes("rar")) return "📦";
    return "📎";
  };

  const formik = useFormik({
    initialValues: {
      captions: "",
      image: "",
      imageName: "",
      video: "",
      videoName: "",
      document: "",
      documentName: ""
    },
    onSubmit: (values, { resetForm }) => {
      if (!values.captions && !values.image && !values.video && !values.document) {
        setError("Please add a caption or media");
        return;
      }

      dispatch(createPostAction(values));
      resetForm();
      setSelectedImage(null);
      setSelectedVideo(null);
      setSelectedDoc(null);
      handleClose();
    },
  });

  return (
    <Modal
      open={open}
      onClose={!isLoading ? handleClose : undefined}
      aria-labelledby="create-post-modal"
    >
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Create Post</Typography>
          <IconButton onClick={handleClose} disabled={isLoading} sx={{ visibility: isLoading ? 'hidden' : 'visible' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <form onSubmit={formik.handleSubmit}>
          <Box display="flex" alignItems="center" gap={2} mb={3}>
            <Avatar src={auth.user?.profilePicture} sx={{ width: 48, height: 48 }} />
            <Box>
              <Typography fontWeight="bold">
                {auth.user?.firstName} {auth.user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                @{auth.user?.firstName?.toLowerCase()}_{auth.user?.lastName?.toLowerCase()}
              </Typography>
            </Box>
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="What's on your mind?"
            name="captions"
            value={formik.values.captions}
            onChange={formik.handleChange}
            sx={{ mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 2, p: 1 } }}
          />

          {error && <Typography color="error" mb={2}>{error}</Typography>}

          <Box display="flex" gap={2} mb={3}>
            <input
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,.rar"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              id="file-input"
              disabled={isLoading}
            />
            <label htmlFor="file-input">
              <IconButton color="primary" component="span" disabled={isLoading}>
                <AddPhotoAlternateIcon />
              </IconButton>
            </label>
            <Typography variant="caption">Upload Media or Document</Typography>
          </Box>

          {selectedImage && (
            <Box position="relative" mb={3}>
              <img src={selectedImage} alt="Selected" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 8 }} />
              <Chip label="Remove" onClick={() => handleRemoveMedia("image")} color="error" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
            </Box>
          )}

          {selectedVideo && (
            <Box position="relative" mb={3}>
              <video controls src={selectedVideo} style={{ width: '100%', maxHeight: 300, borderRadius: 8 }} />
              <Chip label="Remove" onClick={() => handleRemoveMedia("video")} color="error" size="small" sx={{ position: 'absolute', top: 8, right: 8 }} />
            </Box>
          )}

          {selectedDoc && (
            <Box position="relative" mb={3} p={2} border={1} borderRadius={2} borderColor="grey.300">
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="h5">{getFileIcon(selectedDoc.type)}</Typography>
                <Box>
                  <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                    {selectedDoc.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Document
                  </Typography>
                </Box>
              </Box>
              <Chip 
                label="Remove" 
                onClick={() => handleRemoveMedia("document")} 
                color="error" 
                size="small" 
                sx={{ position: 'absolute', top: 8, right: 8 }} 
              />
            </Box>
          )}

          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || (!formik.values.captions && !selectedImage && !selectedVideo && !selectedDoc)}
              sx={{ borderRadius: 6, px: 3 }}
            >
              Post
            </Button>
          </Box>
        </form>

        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: 'rgba(0,0,0,0.8)' }} open={isLoading}>
          <Box textAlign="center">
            <CircularProgress color="inherit" />
            <Typography mt={2}>Uploading file...</Typography>
          </Box>
        </Backdrop>
      </Box>
    </Modal>
  );
};

export default CreatePost;
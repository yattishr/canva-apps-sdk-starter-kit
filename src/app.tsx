import {
  Button,
  FileInput,
  FileInputItem,
  Rows,
  Text,
  MultilineInput,
  TextInput,
  FormField,
  LoadingIndicator,
  ProgressBar,
  Alert,
  Select,
  Box,
  Slider,
} from "@canva/app-ui-kit";
import {
  addNativeElement,
  addPage,
  FontWeight,
  TextAttributes,
  setCurrentPageBackground,
  Dimensions,
  NativeGroupElement,
  getDefaultPageDimensions,
  ImageRef,
} from "@canva/design";
import { CanvaError } from "@canva/error";

import {
  findFonts,
  Font,
  FontStyle,
  FontWeightName,
  requestFontSelection,
  upload,
  getTemporaryUrl,
} from "@canva/asset";

import header_1_sm from "assets/images/header_1_sm.jpg";
import header_2_sm from "assets/images/header_2_sm.jpg";

import styles from "styles/components.css";
import { useState, useEffect, useCallback, useMemo } from "react";

const IMAGE_ELEMENT_WIDTH = 50;
const IMAGE_ELEMENT_HEIGHT = 50;
const TEXT_ELEMENT_WIDTH = 130;
const HEADER_ELEMENT_SCALE_FACTOR = 0.2;
const EMBED_ELEMENT_SCALE_FACTOR = 0.4;

type UIState = {
  text: string;
  color: string;
  size: string;
  capitalization: string;
  variant: string;
  fontWeight: FontWeight;
  fontStyle: TextAttributes["fontStyle"];
  decoration: TextAttributes["decoration"];
  textAlign: TextAttributes["textAlign"];
};

const initialState: UIState = {
  text: "",
  color: "#2d3436",
  size: "medium",
  capitalization: "default",
  variant: "regular",
  fontWeight: "normal",
  fontStyle: "normal",
  decoration: "none",
  textAlign: "center",
};
const appName = "INSIGHT WIZARD";
const appBackgroundColor = "#ffffff";

// Header images
const images = {
  header_1_sm: {
    title: "Header",
    imageSrc: header_1_sm,
  },
  header_2_sm: {
    title: "Header",
    imageSrc: header_2_sm,
  },
};

export const App = () => {
  const [dataUrl, setDataUrl] = useState(header_2_sm);
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [generatedInsights, setGeneratedInsights] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [showDescriptionAlert, setShowDescriptionAlert] = useState(false);

  const [state, setState] = useState<UIState>(initialState);
  const { text, color, fontWeight, fontStyle, decoration, textAlign } = state;

  // ProgressBar state
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // Add state for progress

  const [error, setError] = useState<string | undefined>();
  const [defaultPageDimensions, setDefaultPageDimensions] = useState<
    Dimensions | undefined
  >();

  const [headerImageRef, setHeaderImageRef] = useState<ImageRef | null>(null);

  // Replacing this useEffect to accomodate for localstorage retrieval of the Image Ref.
  // useEffect(() => {
  //   getDefaultPageDimensions().then((dimensions) => {
  //     if (!dimensions) {
  //       setError(
  //         "Adding pages in unbounded documents, such as Whiteboards, is not supported."
  //       );
  //     }
  //     // setBackgroundToSolidColor();
  //     setDefaultPageDimensions(dimensions);
  //   });
  // }, []);


// Updated useEffect to check if the image ref is already stored
useEffect(() => {
  const storedRef = getImageRefFromLocalStorage();
  if (storedRef) {
    setHeaderImageRef(storedRef); // Use the stored ref if available
  } else {
    getDefaultPageDimensions().then((dimensions) => {
      if (!dimensions) {
        setError("Adding pages in unbounded documents, such as Whiteboards, is not supported.");
      }
      setDefaultPageDimensions(dimensions);
    });
  }
}, []);  


  // set the background color
  const setBackgroundToSolidColor = async () => {
    await setCurrentPageBackground({
      color: appBackgroundColor,
    });
  };

  // updated uploadHeaderImage
  // const uploadHeaderImage = useCallback(async () => {
  //   console.log("--- Attempting to upload Header Image... ---");
  //   if (headerImageRef) {
  //     console.log("--- Header Image already uploaded, using existing ref... ---");
  //     return headerImageRef;
  //   }
  
  //   try {
  //     const { ref } = await upload({
  //       type: "IMAGE",
  //       mimeType: "image/jpeg",
  //       url: dataUrl,
  //       thumbnailUrl: dataUrl,
  //     });
  //     console.log("Image uploaded successfully. ImageRef:", ref);
  //     setHeaderImageRef(ref);
  //     return ref;
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //     throw error;
  //   }
  // }, [dataUrl, headerImageRef]);
  // end -- updated uploadHeaderImage

// Updated uploadHeaderImage
const uploadHeaderImage = useCallback(async () => {
  console.log("--- Attempting to upload Header Image... ---");

  // Step 1: Check if the headerImageRef exists
  if (headerImageRef) {
    console.log("--- Checking if header image is already uploaded... ---");
    
    try {
      // Check for existing image with the provided ref
      const { url } = await getTemporaryUrl({
        type: "IMAGE",
        ref: headerImageRef,
      });

      // If a URL is returned, the image is already uploaded
      if (url) {
        console.log("--- Header Image already uploaded, using existing ref... ---", url);
        return headerImageRef; // Return existing ref
      }
    } catch (error) {
      console.error("Error checking for existing image:", error);
    }
  }

  // Step 2: If no existing image, proceed to upload
  try {
    console.log("--- Header Image not found, uploading new image... ---");
    const { ref } = await upload({
      type: "IMAGE",
      mimeType: "image/jpeg",
      url: dataUrl,
      thumbnailUrl: dataUrl,
    });
    console.log("Image uploaded successfully. ImageRef:", ref);
    
    // Save the ref for future use
    setHeaderImageRef(ref);
    return ref;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}, [dataUrl, headerImageRef]);
// End -- updated uploadHeaderImage  

  const memoizedHeaderImageRef = useMemo(() => {
    if (headerImageRef) {
      return headerImageRef;
    }
    
    // Trigger the upload and return a promise that resolves to the ImageRef
    return uploadHeaderImage();
  }, [headerImageRef, uploadHeaderImage]);
      
  // Use memoizedHeaderImageRef instead of calling uploadHeaderImage directly
  const setHeaderImage = useCallback(async () => {
    try {
      const imageRef = await memoizedHeaderImageRef;
      if (!imageRef) {
        console.error("Header image reference is not set");
        return;
      }

      await addNativeElement({
        type: "IMAGE",
        ref: imageRef,
        width: 800,
        height: 172,
        top: 0,
        left: 0,
      });
      console.log("--- Header image added to page from setHeaderImage ---");
    } catch (error) {
      console.error("Error adding image from setHeaderImage:", error);
    }
  }, [memoizedHeaderImageRef]);

      
  const handleFileChange = (files) => {
    console.log("--- handleFileChange ---");
    setFile(files[0]);
  };

  const handleDelete = () => {
    console.log("--- handleDelete ---");
    setFile(null);
  };

  const handleDescriptionChange = (value) => {
    console.log("Description change event:", value);
    setDescription(value);
    setShowDescriptionAlert(false);
  };

  const handleTranslate = (value) => {
    console.log(`Translate option selected: ${value}`);
  };

  // Utility function to store and retrieve from localStorage
  const storeImageRefInLocalStorage = (ref) => {
    localStorage.setItem("headerImageRef", ref);
  };  

  const getImageRefFromLocalStorage = () => {
    return localStorage.getItem("headerImageRef");
  };

  const addTextElement = (text: string) => {
    addNativeElement({
      type: "TEXT",
      color: "#000000",
      fontSize: 25,
      fontWeight: "medium",
      fontStyle: "normal",
      textAlign: "start",
      top: 200,
      left: 100,
      width: 650,
      children: [text],
    });
  };

  const addHeaderTextElement = (text: string) => {
    addNativeElement({
      type: "TEXT",
      color: "#FFFFFF",
      fontSize: 35,
      fontWeight: "heavy",
      textAlign: "center",
      top: 20,
      left: 150,
      width: 550,
      children: [text.toUpperCase()],
    });
  };

  // logic to handle rate limiting when adding new pages.
  const addPageWithRateLimit = async (title: string, elements: any[]) => {
    console.log("--- adding new page from addPageWithRateLimit ---")

    // Retry logic for rate limiting
    const maxRetries = 5;
    const retryDelay = 3000; // 3 seconds

     // Ensure the image is uploaded and ref is set. await and use the memoized Image ref.
    const imageRef = await memoizedHeaderImageRef

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await addPage({ title, elements });
        await setBackgroundToSolidColor();
        await setHeaderImage(); 

          // Update progress as pages are added
          setProgress((prev) => prev + 20);

        console.log("Page added successfully:", title);
        return; // Exit the function if successful
      } catch (error) {
        if (error instanceof CanvaError && error.code === "RATE_LIMITED") {
          console.log(`Rate limit exceeded. Retrying in ${retryDelay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          console.error("Error adding page:", error);
          throw error; // Rethrow if it's not a rate limit error
        }
      }
    }    

    throw new Error("Failed to add page after several retries.");
  };

  const generateReport = async (data: any) => {
    const { title, summary, sections, conclusion } = data;

    // to ensure the progress bar does not exceed 100 steps.
    const totalSteps = sections.length + 2; // title + summary + sections + conclusion
    const increment = 100 / totalSteps;    

    setProgress(0);

    // Add the first page with the title and summary
    await addPageWithRateLimit("Report Title Page", []);
    addHeaderTextElement(title);
    addTextElement(summary);

    // set the Progress
    setProgress((prevProgress) => Math.min(prevProgress + increment, 100));

    // Add a new page for each section
    for (const section of sections) {
      await addPageWithRateLimit(section.heading, []);
      addHeaderTextElement(section.heading);
      addTextElement(section.content);

      // update the progress
      setProgress((prevProgress) => Math.min(prevProgress + increment, 100));
    }

    // Add the conclusion on a new page
    await addPageWithRateLimit("Conclusion", []);
    addHeaderTextElement("Conclusion");
    addTextElement(conclusion);
    setProgress(100); // Ensure it ends at 100%
  };

  const generateInsights = async () => {
    if (!file || !description) {
      setShowDescriptionAlert(true);
      return;
    }

    setIsLoading(true);
    setShowDescriptionAlert(false);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", description);

    try {
      const response = await fetch(`${BACKEND_HOST}/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`--- Logging data from API: ${JSON.stringify(data)}`);
      setGeneratedInsights(data.insights);
      
      await generateReport(data);

      setIsLoading(false);
    } catch (error) {
      console.log("Error generating insights:", error);
      <Alert title={appName} tone="critical">
        Error generating insights. Please try again later.
      </Alert>;
    } finally {
      setIsLoading(false);
    }
  };
  // add new page end

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="2u">
        <Text>
          Generate Insights from your data. Upload your file, describe the
          contents of the file, and we'll generate a report with insights about
          the data.
        </Text>
        <Text>File upload (*.csv, *.txt, *.xlsx)</Text>
        <FileInput
          accept={[".csv", ".txt", ".xlsx"]}
          onDropAcceptedFiles={handleFileChange}
        />
        {file && (
          <FileInputItem label={file.name} onDeleteClick={handleDelete} />
        )}

        <MultilineInput
          autoGrow
          minRows={5}
          placeholder="Describe your data."
          value={description}
          onChange={handleDescriptionChange}
        />

        {/* --- Language Translation feature ---*/}
        {/* Translation text control. Removing this feature for next release after Canva approval. Y.R 12 Sept 2024. */}

        {/*--- Creativity slider control ---*/}
        {/* Removed slider control for Canva review. Re-implement after Canva approval. Y.R 12 Spet 2024. */}

        <Button
          variant="primary"
          onClick={generateInsights}
          stretch
          disabled={isLoading}
        >
          {isLoading ? "Generating Insights..." : "Generate Insights"}
        </Button>

        {/* Progress Bar */}
        {isLoading && (
          <Box padding="2u">
            <ProgressBar size="medium" tone="info" value={progress} />
          </Box>
        )}

        {/* <Text size="xsmall" variant="regular">
          Note: {appName} is available in preview mode only.
        </Text> */}

        {isLoading && <LoadingIndicator /> && (
          <Alert title={appName} tone="info">
            Your insights report is busy.
          </Alert>
        )}

        {showDescriptionAlert && (
          <Alert title={appName} tone="warn">
            Description cannot be empty. Please describe your dataset.
          </Alert>
        )}
      </Rows>
    </div>
  );
};

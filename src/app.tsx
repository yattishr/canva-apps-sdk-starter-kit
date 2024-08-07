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
} from "@canva/asset";

import header_1_sm from "assets/images/header_1_sm.jpg";
import header_2_sm from "assets/images/header_2_sm.jpg";

import styles from "styles/components.css";
import { useState, useEffect, useCallback } from "react";

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
  const [dataUrl, setDataUrl] = useState(header_1_sm);
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

  useEffect(() => {
    getDefaultPageDimensions().then((dimensions) => {
      if (!dimensions) {
        setError(
          "Adding pages in unbounded documents, such as Whiteboards, is not supported."
        );
      }
      // setBackgroundToSolidColor();
      setDefaultPageDimensions(dimensions);
    });
  }, []);

  // set the background color
  const setBackgroundToSolidColor = async () => {
    await setCurrentPageBackground({
      color: appBackgroundColor,
    });
  };

  // const uploadHeaderImage = useCallback(async () => {
  //   console.log("--- Uploading Header Image and setting ImageRef...uploadHeaderImage ---");

  //   if (headerImageRef) {
  //     console.log("--- Header Image already uploaded, skipping... ---");
  //     return;
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
  //   } catch (error) {
  //     console.error("Error uploading image:", error);
  //   }
  // }, [dataUrl, headerImageRef]);

  const uploadHeaderImage = useCallback(async () => {
    console.log("--- Attempting to upload Header Image... ---");
    if (headerImageRef) {
      console.log("--- Header Image already uploaded, skipping... ---");
      return headerImageRef;
    }
  
    try {
      const { ref } = await upload({
        type: "IMAGE",
        mimeType: "image/jpeg",
        url: dataUrl,
        thumbnailUrl: dataUrl,
      });
      console.log("Image uploaded successfully. ImageRef:", ref);
      setHeaderImageRef(ref);
      return ref;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error; // Rethrow the error to handle it where the function is called
    }
  }, [dataUrl, headerImageRef]);
    
  // set header image
  const setHeaderImage = useCallback(async (imageRef) => {

    // this message is logged to the console...
    console.log(`--- Inside setHeaderImage... headerImageRef: ${headerImageRef} ---`);
    
    // the issue lies here....there is no headerImageRef so the code exits at this return statement...
    if (!imageRef) {
      console.error("Header image reference is not set");
      return;
    }

    // this block of code is NEVER executed so the image is not added to the document.
    // BUT the image does get uploaded to Canva and an ImageRef is created.
    try {
      // add the header image with height and width. align to top of page.
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
  }, [headerImageRef]); 

      
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
      color: "#2d3436",
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

     // Ensure the image is uploaded and ref is set
    const imageRef = await uploadHeaderImage();

    // console.log("--- checking to see if headerImageRef is not empty from addPageWithRateLimit ---")
    // if (!headerImageRef) {
    //   console.log("--- headerImageRef is empty...calling uploadHeaderImage from addPageWithRateLimit ---")
    //   await uploadHeaderImage(); // Ensure the image is uploaded and ref is set before adding pages
    // }    

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await addPage({ title, elements });
        await setBackgroundToSolidColor();
        await setHeaderImage(imageRef); // Pass the headerImageRef if necessary
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

    // Add the first page with the title and summary
    await addPageWithRateLimit("Report Title Page", []);
    addHeaderTextElement(title);
    addTextElement(summary);

    // Add a new page for each section
    for (const section of sections) {
      await addPageWithRateLimit(section.heading, []);
      addHeaderTextElement(section.heading);
      addTextElement(section.content);
    }

    // Add the conclusion on a new page
    await addPageWithRateLimit("Conclusion", []);
    addHeaderTextElement("Conclusion");
    addTextElement(conclusion);
  };

  const generateInsights = async () => {
    if (!file || !description) {
      setShowDescriptionAlert(true);
      return;
    }

    setIsLoading(true);
    setShowDescriptionAlert(false);

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

        <Text>
          {appName} offers translations to six different languages. Choose your
          preferred language from the options below:
        </Text>
        <Select
          onChange={handleTranslate}
          options={[
            {
              label: "English",
              value: "english",
            },
            {
              label: "French",
              value: "french",
            },
            {
              label: "German",
              value: "german",
            },
            {
              label: "Italian",
              value: "italian",
            },
            {
              label: "Hindi",
              value: "hindi",
            },
            {
              label: "Chinese",
              value: "chinese",
            },
          ]}
        />

        {/* Creativity slider control */}
        <Text>
          {appName} can also make your report sound more or less creative. Move
          the slider below to give it a try!
        </Text>
        <Box paddingStart="2u">
          <Slider defaultValue={0} max={7} min={1} step={1} />
        </Box>

        <Button
          variant="primary"
          onClick={generateInsights}
          stretch
          disabled={isLoading}
        >
          {isLoading ? "Generating Insights..." : "Generate Insights"}
        </Button>

        <Text size="xsmall" variant="regular">
          Note: {appName} is available in preview mode only.
        </Text>

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

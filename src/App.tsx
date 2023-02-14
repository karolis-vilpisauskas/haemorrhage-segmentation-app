import { Button, CircularProgress, Dialog, DialogContent, Grid } from "@mui/material";
import { Box } from "@mui/system";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";

function App() {
   const [loading, setLoading] = useState<boolean>(false);
   const [selectedFile, setSelectedFile] = useState<string | null>(null);
   const [model, setModel] = useState<tf.GraphModel<string | tf.io.IOHandler> | null>(null);
   const [predictionSrc, setPredictionSrc] = useState<string>("");

   const loadModel = useCallback(async (modelType?: "unet" | "linket") => {
      setLoading(true);
      const modelToLoad = modelType === "linket" ? "/linknet-model" : "/unet-model/model.json";
      const model = await tf.loadGraphModel(modelToLoad);
      setModel(model);
      setLoading(false);
   }, []);

   const handleUpload = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
         setLoading(true);
         const file = e.target?.files?.[0];
         if (!file) return;
         const reader = new FileReader();
         reader.readAsDataURL(file);
         reader.onload = function () {
            console.log({
               reader: reader.result,
            });
            setSelectedFile(reader.result as string);
            const im = new Image();
            im.crossOrigin = "anonymous";
            im.src = (reader.result as string) ?? "";
            im.height = 512;
            im.width = 512;
            console.log({
               model1: model,
            });
            im.onload = async () => {
               const tensor = tf.browser.fromPixels(im).squeeze();
               const resized = tensor.resizeBilinear([512, 512]);
               const expanded = tf.expandDims(resized, 0);
               // const reshape = tensor.reshape([2, 512, 512, 3]);
               const predictionResult = model?.predict(expanded);
               tf.dispose(expanded);
               const data = await (predictionResult as any).dataSync();
               tf.dispose(predictionResult);

               const imagedata = new ImageData(Uint8ClampedArray.from(data), 256, 256);
               console.log(imagedata);
               var canvas = document.createElement("canvas");
               var ctx = canvas.getContext("2d");
               canvas.width = imagedata.width;
               canvas.height = imagedata.height;
               ctx?.putImageData(imagedata, 0, 0);
               console.log(canvas.toDataURL());
               setPredictionSrc(canvas.toDataURL());
            };

            setLoading(false);
         };
         reader.onerror = function (error) {
            console.log("Error: ", error);
         };
      },
      [model],
   );

   useEffect(() => {
      loadModel();
   }, []);

   return (
      <>
         <Grid container component="main" sx={{ height: "100vh", width: "100vw" }}>
            <Grid item>
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: "column",
                     padding: "16px",
                  }}
               >
                  <Button variant="contained" component="label">
                     Upload Image
                     <input hidden accept="image/*" type="file" onChange={handleUpload} />
                  </Button>
                  {selectedFile && (
                     <>
                        <Box
                           component="img"
                           sx={{
                              borderRadius: "8px",
                              maxWidth: "500px",
                              marginTop: "10px",
                           }}
                           src={selectedFile}
                           alt="Uploaded Image"
                        />
                     </>
                  )}
               </Box>
            </Grid>
            <Grid item>{/* TODO Add grid mapped images */}</Grid>
         </Grid>
         <Dialog
            open={loading}
            PaperProps={{
               sx: {
                  background: "transparent",
               },
            }}
         >
            <DialogContent sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
               <CircularProgress size={80} />
            </DialogContent>
         </Dialog>
      </>
   );
}

export default App;

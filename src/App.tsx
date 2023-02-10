import { Button, Grid } from "@mui/material";
import { useState } from "react";

function App() {
   return (
      <main>
         <Grid container>
            <Grid item>
               <Button variant="contained" component="label">
                  Upload Image
                  <input hidden accept="image/*" type="file" />
               </Button>
            </Grid>
         </Grid>
      </main>
   );
}

export default App;

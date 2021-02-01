import { SkinBasedChromas } from './list';
import { ahriSkins } from './Ahri';

export async function loadAndSaveSkins(skinBasesChromas: SkinBasedChromas[]) {
  skinBasesChromas.map(async skinBasedChroma => {
    const data = await fetch(skinBasedChroma.imageUrl);

    await skinBasedChroma.chromas.map(async chroma => {
      const chromaData = await fetch(chroma.imageUrl);

      console.debug(chromaData);

    })

    console.debug(data);
  });
}

export async function loadSkinData() {
  // await loadAndSaveSkins(ahriSkins);
}
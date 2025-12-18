# Carpeta de Videos

## Instrucciones para agregar tu video

1. **Coloca tu archivo de video aquí**: Esta carpeta es donde debes poner tu archivo `.mp4`

2. **Nombre del archivo**: 
   - El componente está configurado para buscar: `hero-video.mp4`
   - Si quieres usar otro nombre, edita el archivo `components/HeroVideo.tsx` y cambia la ruta en la línea del `<source>`

3. **Formato recomendado**:
   - Formato: `.mp4` (H.264 codec)
   - Resolución: 1920x1080 (Full HD) o superior
   - Duración: Recomendado entre 10-30 segundos
   - Tamaño: Intenta mantener el archivo optimizado (menos de 50MB si es posible)

4. **Ejemplo de estructura**:
   ```
   public/
     videos/
       hero-video.mp4  ← Coloca tu video aquí
   ```

5. **Si no tienes un video aún**: 
   - El componente mostrará un mensaje de fallback
   - Puedes usar un video de prueba o placeholder temporalmente

## Nota
El video se reproducirá automáticamente cuando se carga la página, sin sonido (muted), y cuando termine, aparecerán las 3 cards de servicios.


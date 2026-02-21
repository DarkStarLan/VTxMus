<template>
  <div class="music-player" v-if="playerStore.currentSong">
    <audio
      ref="audioRef"
      :src="audioUrl"
      crossorigin="anonymous"
      preload="auto"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
      @play="playerStore.isPlaying = true"
      @pause="playerStore.isPlaying = false"
      @error="onAudioError"
      @seeking="onSeeking"
      @seeked="onSeeked"
    />

    <div class="player-content">
      <div class="song-info" @click="goToPlayPage">
        <img :src="playerStore.currentSong.album.picUrl" :alt="playerStore.currentSong.name" class="album-cover" />
        <div class="info-text">
          <div ref="songNameRef" class="song-name" :class="{ marquee: needMarqueeSongName }">
            <span :data-text="playerStore.currentSong.name">{{ playerStore.currentSong.name }}</span>
          </div>
          <div ref="artistNameRef" class="artist-name" :class="{ marquee: needMarqueeArtist }">
            <span :data-text="playerStore.currentSong.artists.map(a => a.name).join(' / ')">{{ playerStore.currentSong.artists.map(a => a.name).join(' / ') }}</span>
          </div>
        </div>
      </div>

      <div class="player-controls">
        <div class="control-buttons">
          <button @click="playerStore.togglePlaylist" class="playlist-btn mobile-only" :class="{ active: playerStore.showPlaylist }" :title="playerStore.showPlaylist ? '隐藏播放列表' : '显示播放列表'">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"/>
            </svg>
          </button>
          <div class="settings-selector mobile-only">
            <button @click="toggleSettingsMenu" class="settings-btn" title="播放器设置">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
                <path d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z"/>
              </svg>
              <span class="settings-label">设置</span>
            </button>
            <div v-if="showSettingsMenu" class="settings-menu" @click.stop>
              <div class="menu-section">
                <div class="menu-section-title">音质选择</div>
                <div
                  v-for="option in qualityOptions"
                  :key="option.value"
                  class="quality-option"
                  :class="{ active: playerStore.musicQuality === option.value }"
                  @click="changeQuality(option.value)"
                >
                  <span class="option-label">{{ option.label }}</span>
                  <span class="option-desc">{{ option.desc }}</span>
                </div>
              </div>
              <div class="menu-divider"></div>
              <div class="menu-section">
                <div class="menu-section-title">音量调节</div>
                <div class="volume-control-inline">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-svg volume-icon-small">
                    <path fill="currentColor" d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/>
                  </svg>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    v-model.number="playerStore.volume"
                    @input="updateVolume"
                    class="volume-slider-inline"
                  />
                  <span class="volume-value">{{ Math.round(playerStore.volume * 100) }}%</span>
                </div>
              </div>
            </div>
          </div>
          <div class="quality-selector desktop-only">
            <button @click="toggleQualityMenu" class="quality-btn" :title="'当前音质：' + currentQualityLabel">
              <span class="quality-label">{{ currentQualityLabel }}</span>
            </button>
            <div v-if="showQualityMenu" class="quality-menu" @click.stop>
              <div class="menu-section">
                <div class="menu-section-title">音质选择</div>
                <div
                  v-for="option in qualityOptions"
                  :key="option.value"
                  class="quality-option"
                  :class="{ active: playerStore.musicQuality === option.value }"
                  @click="changeQuality(option.value)"
                >
                  <span class="option-label">{{ option.label }}</span>
                  <span class="option-desc">{{ option.desc }}</span>
                </div>
              </div>
            </div>
          </div>
          <button @click="playerStore.togglePlayMode" class="mode-btn" :title="playModeText">
            <svg v-if="playerStore.playMode === 'sequence'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96l160 0 0 32c0 12.9 7.8 24.6 19.8 29.6s25.7 2.2 34.9-6.9l64-64c12.5-12.5 12.5-32.8 0-45.3l-64-64c-9.2-9.2-22.9-11.9-34.9-6.9S320 19.1 320 32l0 32L160 64C71.6 64 0 135.6 0 224zm512 64c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96l-160 0 0-32c0-12.9-7.8-24.6-19.8-29.6s-25.7-2.2-34.9 6.9l-64 64c-12.5 12.5-12.5 32.8 0 45.3l64 64c9.2 9.2 22.9 11.9 34.9 6.9s19.8-16.6 19.8-29.6l0-32 160 0c88.4 0 160-71.6 160-160z"/>
            </svg>
            <svg v-else-if="playerStore.playMode === 'loop'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M0 224c0 17.7 14.3 32 32 32s32-14.3 32-32c0-53 43-96 96-96l160 0 0-32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c12.5 12.5 12.5 32.8 0 45.3l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32L160 192c-53 0-96 43-96 96zm192 96c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 64c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0 0-32zm288-32c0-17.7-14.3-32-32-32s-32 14.3-32 32c0 53-43 96-96 96l-160 0 0 32c0 12.9-7.8 24.6-19.8 29.6s-25.7 2.2-34.9-6.9l-64-64c-12.5-12.5-12.5-32.8 0-45.3l64-64c9.2-9.2 22.9-11.9 34.9-6.9s19.8 16.6 19.8 29.6l0 32 160 0c88.4 0 160 71.6 160 160z"/>
            </svg>
            <svg v-else-if="playerStore.playMode === 'random'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M403.8 34.4c12-5 25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32-32 0c-10.1 0-19.6 4.7-25.6 12.8L284 229.3 244 176l31.2-41.6C293.3 110.2 321.8 96 352 96l32 0 0-32c0-12.9 7.8-24.6 19.8-29.6zM164 282.7L204 336l-31.2 41.6C154.7 401.8 126.2 416 96 416l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c10.1 0 19.6-4.7 25.6-12.8L164 282.7zm274.6 188c-9.2 9.2-22.9 11.9-34.9 6.9s-19.8-16.6-19.8-29.6l0-32-32 0c-30.2 0-58.7-14.2-76.8-38.4L121.6 172.8c-6-8.1-15.5-12.8-25.6-12.8l-64 0c-17.7 0-32-14.3-32-32s14.3-32 32-32l64 0c30.2 0 58.7 14.2 76.8 38.4L326.4 339.2c6 8.1 15.5 12.8 25.6 12.8l32 0 0-32c0-12.9 7.8-24.6 19.8-29.6s25.7-2.2 34.9 6.9l64 64c6 6 9.4 14.1 9.4 22.6s-3.4 16.6-9.4 22.6l-64 64z"/>
            </svg>
            <svg v-else-if="playerStore.playMode === 'recommend'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M499.1 6.3c8.1 6 12.9 15.6 12.9 25.7l0 72 0 264c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L448 147 192 223.8 192 432c0 44.2-43 80-96 80s-96-35.8-96-80s43-80 96-80c11.2 0 22 1.6 32 4.6L128 200l0-72c0-14.1 9.3-26.6 22.8-30.7l320-96c9.7-2.9 20.2-1.1 28.3 5z"/>
            </svg>
          </button>
          <button @click="playerStore.prevSong" :disabled="!playerStore.hasPrev" class="control-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M459.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4L288 214.3l0 41.7 0 41.7L459.5 440.6zM256 352l0-96 0-128 0-32c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160C4.2 237.5 0 246.5 0 256s4.2 18.5 11.5 24.6l192 160c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-64z"/>
            </svg>
          </button>
          <button @click="togglePlay" class="play-btn">
            <svg v-if="playerStore.isPlaying" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" class="icon-svg">
              <path d="M48 64C21.5 64 0 85.5 0 112L0 400c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48L48 64zm192 0c-26.5 0-48 21.5-48 48l0 288c0 26.5 21.5 48 48 48l32 0c26.5 0 48-21.5 48-48l0-288c0-26.5-21.5-48-48-48l-32 0z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-svg">
              <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
            </svg>
          </button>
          <button @click="playerStore.nextSong" :disabled="!playerStore.hasNext" class="control-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4L224 214.3l0 41.7 0 41.7L52.5 440.6zM256 352l0-96 0-128 0-32c0-12.4 7.2-23.7 18.4-29s24.5-3.6 34.1 4.4l192 160c7.3 6.1 11.5 15.1 11.5 24.6s-4.2 18.5-11.5 24.6l-192 160c-9.5 7.9-22.8 9.7-34.1 4.4s-18.4-16.6-18.4-29l0-64z"/>
            </svg>
          </button>
          <button @click="toggleFavorite" class="fav-btn" :class="{ active: isFavorite }">
            <svg v-if="isFavorite" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M241 87.1l15 20.7 15-20.7C296 52.5 336.2 32 378.9 32 452.4 32 512 91.6 512 165.1l0 2.6c0 112.2-139.9 242.5-212.9 298.2-12.4 9.4-27.6 14.1-43.1 14.1s-30.8-4.6-43.1-14.1C139.9 410.2 0 279.9 0 167.7l0-2.6C0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M378.9 80c-27.3 0-53 13.1-69 35.2l-34.4 47.6c-4.5 6.2-11.7 9.9-19.4 9.9s-14.9-3.7-19.4-9.9l-34.4-47.6c-16-22.1-41.7-35.2-69-35.2-47 0-85.1 38.1-85.1 85.1 0 49.9 32 98.4 68.1 142.3 41.1 50 91.4 94 125.9 120.3 3.2 2.4 7.9 4.2 14 4.2s10.8-1.8 14-4.2c34.5-26.3 84.8-70.4 125.9-120.3 36.2-43.9 68.1-92.4 68.1-142.3 0-47-38.1-85.1-85.1-85.1zM271 87.1c25-34.6 65.2-55.1 107.9-55.1 73.5 0 133.1 59.6 133.1 133.1 0 68.6-42.9 128.9-79.1 172.8-44.1 53.6-97.3 100.1-133.8 127.9-12.3 9.4-27.5 14.1-43.1 14.1s-30.8-4.7-43.1-14.1C176.4 438 123.2 391.5 79.1 338 42.9 294.1 0 233.7 0 165.1 0 91.6 59.6 32 133.1 32 175.8 32 216 52.5 241 87.1l15 20.7 15-20.7z"/>
            </svg>
          </button>
          <button @click="shareMusic" class="share-btn" title="分享">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path d="M307 34.8c-11.5 5.1-19 16.6-19 29.2l0 64-112 0C78.8 128 0 206.8 0 304C0 417.3 81.5 467.9 100.2 478.1c2.5 1.4 5.3 1.9 8.1 1.9c10.9 0 19.7-8.9 19.7-19.7c0-7.5-4.3-14.4-9.8-19.5C108.8 431.9 96 414.4 96 384c0-53 43-96 96-96l96 0 0 64c0 12.6 7.4 24.1 19 29.2s25 3 34.4-5.4l160-144c6.7-6.1 10.6-14.7 10.6-23.8s-3.8-17.7-10.6-23.8l-160-144c-9.4-8.5-22.9-10.6-34.4-5.4z"/>
            </svg>
          </button>
          <!-- 桌面歌词按钮（仅在 Electron 环境显示） -->
          <button
            v-if="isElectronEnv"
            @click="playerStore.toggleDesktopLyric"
            class="control-btn lyric-btn"
            :class="{ active: playerStore.showDesktopLyric, locked: playerStore.isLyricLocked }"
            :title="getLyricButtonTitle()"
          >
            <!-- 已锁定：锁图标 -->
            <svg v-if="playerStore.isLyricLocked" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-svg">
              <path fill="currentColor" d="M128 96l0 64 128 0 0-64c0-35.3-28.7-64-64-64s-64 28.7-64 64zM64 160l0-64C64 25.3 121.3-32 192-32S320 25.3 320 96l0 64c35.3 0 64 28.7 64 64l0 224c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 224c0-35.3 28.7-64 64-64z"/>
            </svg>
            <!-- 未锁定：字幕图标（打开/关闭都用这个） -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
              <path fill="currentColor" d="M0 128C0 92.7 28.7 64 64 64l384 0c35.3 0 64 28.7 64 64l0 256c0 35.3-28.7 64-64 64L64 448c-35.3 0-64-28.7-64-64L0 128zm152 80l32 0c4.4 0 8 3.6 8 8 0 13.3 10.7 24 24 24s24-10.7 24-24c0-30.9-25.1-56-56-56l-32 0c-30.9 0-56 25.1-56 56l0 80c0 30.9 25.1 56 56 56l32 0c30.9 0 56-25.1 56-56 0-13.3-10.7-24-24-24s-24 10.7-24 24c0 4.4-3.6 8-8 8l-32 0c-4.4 0-8-3.6-8-8l0-80c0-4.4 3.6-8 8-8zm168 8c0-4.4 3.6-8 8-8l32 0c4.4 0 8 3.6 8 8 0 13.3 10.7 24 24 24s24-10.7 24-24c0-30.9-25.1-56-56-56l-32 0c-30.9 0-56 25.1-56 56l0 80c0 30.9 25.1 56 56 56l32 0c30.9 0 56-25.1 56-56 0-13.3-10.7-24-24-24s-24 10.7-24 24c0 4.4-3.6 8-8 8l-32 0c-4.4 0-8-3.6-8-8l0-80z"/>
            </svg>
          </button>
        </div>

        <div class="progress-bar">
          <span class="time">{{ formatTime(isDragging ? dragTime : playerStore.currentTime) }}</span>
          <div
            class="progress-container"
            @mousedown="startDrag"
            @touchstart="startDrag"
            ref="progressContainerRef"
          >
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: (isDragging ? dragProgress : playerStore.progress) + '%' }"></div>
              <div
                class="progress-thumb"
                :style="{ left: (isDragging ? dragProgress : playerStore.progress) + '%' }"
                :class="{ dragging: isDragging }"
              ></div>
            </div>
          </div>
          <span class="time">{{ formatTime(playerStore.duration) }}</span>
        </div>
      </div>

      <div class="right-controls">
        <div class="volume-control">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-svg volume-icon">
            <path fill="currentColor" d="M533.6 32.5C598.5 85.2 640 165.8 640 256s-41.5 170.7-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64l0 384c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352 64 352c-35.3 0-64-28.7-64-64l0-64c0-35.3 28.7-64 64-64l67.8 0L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z"/>
          </svg>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            v-model.number="playerStore.volume"
            @input="updateVolume"
            class="volume-slider"
          />
        </div>
        <button @click="playerStore.togglePlaylist" class="playlist-btn desktop-only" :class="{ active: playerStore.showPlaylist }" :title="playerStore.showPlaylist ? '隐藏播放列表' : '显示播放列表'">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="icon-svg">
            <path d="M40 48C26.7 48 16 58.7 16 72l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24L40 48zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L192 64zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l288 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-288 0zM16 232l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24l0 48c0 13.3 10.7 24 24 24l48 0c13.3 0 24-10.7 24-24l0-48c0-13.3-10.7-24-24-24l-48 0z"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { getSongUrl } from '@/api/netease'
import { toast } from '@/utils/toast'
import { isElectron } from '@/utils/electron-bridge'

const router = useRouter()
const playerStore = usePlayerStore()
const audioRef = ref<HTMLAudioElement>()
const audioUrl = ref('')
const isInitialLoad = ref(true) // 标记是否是首次加载
const savedCurrentTime = ref(playerStore.currentTime) // 保存初始播放进度
const shouldUpdateTime = ref(false) // 控制是否更新播放进度
const hasRestoredProgress = ref(false) // 标记是否已恢复进度
const showSettingsMenu = ref(false) // 显示设置菜单（移动端）
const showQualityMenu = ref(false) // 显示音质菜单（桌面端）
const isElectronEnv = isElectron() // 检测是否在 Electron 环境中

// 获取歌词按钮标题
function getLyricButtonTitle() {
  if (playerStore.isLyricLocked) {
    return '解锁歌词窗口'
  }
  return playerStore.showDesktopLyric ? '关闭桌面歌词' : '打开桌面歌词'
}

// 跑马灯相关
const songNameRef = ref<HTMLElement>()
const artistNameRef = ref<HTMLElement>()
const needMarqueeSongName = ref(false)
const needMarqueeArtist = ref(false)

// 检测文本是否溢出（被截断）
function checkTextOverflow() {
  if (typeof window === 'undefined') return
  const isMobile = window.innerWidth <= 768
  if (!isMobile) {
    needMarqueeSongName.value = false
    needMarqueeArtist.value = false
    return
  }

  nextTick(() => {
    // 检测歌名是否溢出
    if (songNameRef.value) {
      const element = songNameRef.value
      needMarqueeSongName.value = element.scrollWidth > element.clientWidth
    }

    // 检测歌手名是否溢出
    if (artistNameRef.value) {
      const element = artistNameRef.value
      needMarqueeArtist.value = element.scrollWidth > element.clientWidth
    }
  })
}

// 监听歌曲变化，重新检测
watch(() => playerStore.currentSong, () => {
  checkTextOverflow()
})

// 监听窗口大小变化
onMounted(() => {
  checkTextOverflow()
  window.addEventListener('resize', checkTextOverflow)
})

// 清理
onUnmounted(() => {
  window.removeEventListener('resize', checkTextOverflow)
})

// 音质选项
const qualityOptions = [
  { value: 'standard', label: '标准', desc: '128kbps' },
  { value: 'exhigh', label: '极高', desc: '320kbps' },
  { value: 'lossless', label: '无损', desc: 'FLAC' },
  { value: 'hires', label: 'Hi-Res', desc: '24bit' },
  { value: 'jyeffect', label: '环绕声', desc: 'VIP' },
  { value: 'sky', label: '沉浸声', desc: 'SVIP' },
  { value: 'jymaster', label: '母带', desc: 'SVIP' }
]

const currentQualityLabel = computed(() => {
  const quality = qualityOptions.find(q => q.value === playerStore.musicQuality)
  return quality?.label || '无损'
})

const playModeIcon = computed(() => {
  const icons = { sequence: '🔁', loop: '🔂', random: '🔀', recommend: '🎵' }
  return icons[playerStore.playMode]
})

const playModeText = computed(() => {
  const texts = { sequence: '顺序播放', loop: '单曲循环', random: '随机播放', recommend: '推荐模式' }
  return texts[playerStore.playMode]
})

const isFavorite = computed(() => {
  return playerStore.currentSong ? playerStore.isFavorite(playerStore.currentSong.id) : false
})

watch(() => playerStore.currentSong, async (newSong, oldSong) => {
  if (newSong) {
    try {
      // 先暂停并清空当前音频
      if (audioRef.value) {
        audioRef.value.pause()
        audioUrl.value = ''
      }

      const url = await getSongUrl(newSong.id, playerStore.musicQuality)
      console.log('获取到的播放 URL:', url)

      // 等待下一帧再设置 URL，确保清空操作完成
      await new Promise(resolve => setTimeout(resolve, 0))
      audioUrl.value = url

      // 等待音频加载
      if (audioRef.value) {
        await new Promise((resolve, reject) => {
          const audio = audioRef.value!
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay)
            audio.removeEventListener('error', onError)
            resolve(true)
          }
          const onError = (e: Event) => {
            audio.removeEventListener('canplay', onCanPlay)
            audio.removeEventListener('error', onError)
            reject(new Error('音频加载失败'))
          }
          audio.addEventListener('canplay', onCanPlay)
          audio.addEventListener('error', onError)
        })

        // 如果是首次加载（从本地存储恢复）
        if (isInitialLoad.value && oldSong === null) {
          // 恢复播放进度
          if (savedCurrentTime.value > 0) {
            audioRef.value.currentTime = savedCurrentTime.value
            hasRestoredProgress.value = true
          }
          // 由于浏览器的自动播放策略，首次加载时不自动播放
          playerStore.isPlaying = false
          isInitialLoad.value = false
        } else {
          // 非首次加载（用户主动点击播放或切歌）
          if (playerStore.isPlaying) {
            await audioRef.value.play()
          }
        }

        // 启用时间更新（无论是首次加载还是切歌）
        shouldUpdateTime.value = true
      }
    } catch (error) {
      console.error('加载歌曲失败:', error)
      // 只在非自动播放策略错误时显示提示
      if (!(error instanceof Error && error.name === 'NotAllowedError')) {
        toast.error(`播放失败: ${error instanceof Error ? error.message : '未知错误'}`)
      }
      playerStore.isPlaying = false
    }
  }
}, { immediate: true })

// 添加播放状态锁，防止快速切换导致冲突
const isPlayPending = ref(false)

watch(() => playerStore.isPlaying, async (playing) => {
  if (audioRef.value && audioUrl.value) {
    if (playing) {
      // 如果正在处理播放请求，忽略
      if (isPlayPending.value) return

      isPlayPending.value = true

      // 启用时间更新
      shouldUpdateTime.value = true
      // 如果是首次播放且有保存的进度且还没恢复过，先恢复进度
      if (!hasRestoredProgress.value && savedCurrentTime.value > 0) {
        audioRef.value.currentTime = savedCurrentTime.value
        hasRestoredProgress.value = true
      }

      try {
        await audioRef.value.play()
      } catch (err: any) {
        // 忽略 AbortError（用户主动暂停导致的中断）
        if (err.name !== 'AbortError') {
          console.error('播放失败:', err)
          playerStore.isPlaying = false
        }
      } finally {
        isPlayPending.value = false
      }
    } else {
      // 暂停操作
      audioRef.value.pause()
    }
  }
})

watch(() => playerStore.volume, (vol) => {
  if (audioRef.value) {
    audioRef.value.volume = vol
  }
})

function togglePlay() {
  playerStore.togglePlay()
}

function toggleFavorite() {
  if (playerStore.currentSong) {
    playerStore.toggleFavorite(playerStore.currentSong.id)
  }
}

async function shareMusic() {
  if (!playerStore.currentSong) return

  try {
    // 获取音频URL
    let audioUrl = await getSongUrl(playerStore.currentSong.id, playerStore.musicQuality)

    // 如果是代理URL，提取真实的远程URL
    if (audioUrl.includes('localhost') || audioUrl.includes('proxy')) {
      const urlMatch = audioUrl.match(/url=(.+)/)
      if (urlMatch && urlMatch[1]) {
        audioUrl = decodeURIComponent(urlMatch[1])
      }
    }

    const songName = playerStore.currentSong.name
    const artistName = playerStore.currentSong.artists.map(a => a.name).join('、')

    // 构建分享文本，只包含远程URL
    const shareText = `我通过VTxMus向你分享了《${songName}》 - ${artistName}，点击网址即可播放：${audioUrl}`

    // 尝试使用现代的 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareText)
      toast.success('分享链接已复制到剪贴板！')
    } else {
      // 降级方案：使用传统的 execCommand
      const textarea = document.createElement('textarea')
      textarea.value = shareText
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      toast.success('分享链接已复制到剪贴板！')
    }
  } catch (error) {
    console.error('分享失败:', error)
    toast.error('分享失败，请稍后重试')
  }
}

function onTimeUpdate() {
  // 只在允许更新时间时才更新 store 中的 currentTime
  // 并且音频必须真正开始播放（不在 seeking 状态）
  if (audioRef.value && shouldUpdateTime.value && !isSeeking.value && !audioRef.value.paused) {
    playerStore.currentTime = audioRef.value.currentTime
  }
}

function onLoadedMetadata() {
  if (audioRef.value) {
    playerStore.duration = audioRef.value.duration
    audioRef.value.volume = playerStore.volume
  }
}

function onEnded() {
  if (playerStore.playMode === 'loop') {
    audioRef.value?.play()
  } else {
    playerStore.nextSong()
  }
}

function onAudioError(e: Event) {
  const audio = e.target as HTMLAudioElement
  const error = audio.error

  // 忽略空 src 的错误（初始状态）
  if (!audioUrl.value || audioUrl.value === '') {
    return
  }

  console.error('音频加载错误:', {
    code: error?.code,
    message: error?.message,
    src: audio.src,
    networkState: audio.networkState,
    readyState: audio.readyState
  })

  let errorMsg = '音频加载失败'
  if (error) {
    switch (error.code) {
      case 1: errorMsg = '音频加载被中止'; break
      case 2: errorMsg = '网络错误'; break
      case 3: errorMsg = '音频解码失败'; break
      case 4: errorMsg = '不支持的音频格式'; break
    }
  }
  toast.error(errorMsg)
}

const isDragging = ref(false)
const dragProgress = ref(0)
const dragTime = ref(0)
const progressContainerRef = ref<HTMLElement>()
const isSeeking = ref(false)

function startDrag(e: MouseEvent | TouchEvent) {
  e.preventDefault()
  e.stopPropagation()

  if (!progressContainerRef.value || !audioRef.value) return

  isDragging.value = true
  const container = progressContainerRef.value
  const rect = container.getBoundingClientRect()

  const updateProgress = (clientX: number) => {
    let percent = (clientX - rect.left) / rect.width
    percent = Math.max(0, Math.min(1, percent)) // 限制在 0-1 之间

    // 只更新视觉效果，不改变实际播放位置
    dragProgress.value = percent * 100
    dragTime.value = percent * playerStore.duration
  }

  const handleMove = (moveEvent: MouseEvent | TouchEvent) => {
    moveEvent.preventDefault()

    let clientX: number
    if (moveEvent instanceof MouseEvent) {
      clientX = moveEvent.clientX
    } else {
      clientX = moveEvent.touches[0]?.clientX ?? 0
    }

    updateProgress(clientX)
  }

  const handleEnd = async () => {
    // 松手时才真正跳转播放进度
    if (audioRef.value) {
      isSeeking.value = true
      const wasPlaying = playerStore.isPlaying

      try {
        // 设置新的播放位置
        audioRef.value.currentTime = dragTime.value

        // 如果之前在播放，等待 seeked 事件后继续播放
        if (wasPlaying && audioRef.value.paused) {
          await audioRef.value.play()
        }
      } catch (error) {
        console.error('跳转播放进度失败:', error)
      }
    }

    isDragging.value = false
    document.removeEventListener('mousemove', handleMove as any)
    document.removeEventListener('mouseup', handleEnd)
    document.removeEventListener('touchmove', handleMove as any, { passive: false } as any)
    document.removeEventListener('touchend', handleEnd)
  }

  document.addEventListener('mousemove', handleMove as any)
  document.addEventListener('mouseup', handleEnd)
  document.addEventListener('touchmove', handleMove as any, { passive: false })
  document.addEventListener('touchend', handleEnd)

  // 立即更新一次位置
  let clientX: number
  if (e instanceof MouseEvent) {
    clientX = e.clientX
  } else {
    clientX = e.touches[0]?.clientX ?? 0
  }
  updateProgress(clientX)
}

function onSeeking() {
  isSeeking.value = true
}

function onSeeked() {
  isSeeking.value = false
}

function updateVolume() {
  if (audioRef.value) {
    audioRef.value.volume = playerStore.volume
  }
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function goToPlayPage() {
  router.push('/play')
}

function toggleSettingsMenu() {
  showSettingsMenu.value = !showSettingsMenu.value
}

function toggleQualityMenu() {
  showQualityMenu.value = !showQualityMenu.value
}

async function changeQuality(quality: string) {
  if (quality === playerStore.musicQuality) {
    showSettingsMenu.value = false
    showQualityMenu.value = false
    return
  }

  const wasPlaying = playerStore.isPlaying
  const currentTimeBackup = playerStore.currentTime

  try {
    // 设置新音质
    playerStore.setMusicQuality(quality as any)
    showSettingsMenu.value = false
    showQualityMenu.value = false

    // 如果有正在播放的歌曲，重新加载
    if (playerStore.currentSong) {
      // 暂停当前播放
      if (audioRef.value) {
        audioRef.value.pause()
      }

      // 重新获取URL
      const url = await getSongUrl(playerStore.currentSong.id, quality)
      audioUrl.value = ''
      await new Promise(resolve => setTimeout(resolve, 0))
      audioUrl.value = url

      // 等待音频加载
      if (audioRef.value) {
        await new Promise((resolve, reject) => {
          const audio = audioRef.value!
          const onCanPlay = () => {
            audio.removeEventListener('canplay', onCanPlay)
            audio.removeEventListener('error', onError)
            resolve(true)
          }
          const onError = (e: Event) => {
            audio.removeEventListener('canplay', onCanPlay)
            audio.removeEventListener('error', onError)
            reject(new Error('音频加载失败'))
          }
          audio.addEventListener('canplay', onCanPlay)
          audio.addEventListener('error', onError)
        })

        // 恢复播放进度
        audioRef.value.currentTime = currentTimeBackup

        // 如果之前在播放，继续播放
        if (wasPlaying) {
          await audioRef.value.play()
          playerStore.isPlaying = true
        }
      }

      toast.success(`已切换到${qualityOptions.find(q => q.value === quality)?.label}音质`)
    }
  } catch (error) {
    console.error('切换音质失败:', error)
    toast.error('切换音质失败，请稍后重试')
    playerStore.isPlaying = wasPlaying
  }
}

// 点击外部关闭设置菜单和音质菜单
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.settings-selector') && !target.closest('.quality-selector')) {
    showSettingsMenu.value = false
    showQualityMenu.value = false
  }
}

watch([showSettingsMenu, showQualityMenu], ([showSettings, showQuality]) => {
  if (showSettings || showQuality) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})
</script>

<style scoped>
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #1a2a32 0%, #305669 100%);
  border-top: 1px solid rgba(183, 229, 205, 0.2);
  padding: 16px 24px;
  z-index: 1001;
  backdrop-filter: blur(20px);
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.player-content {
  display: flex;
  align-items: center;
  gap: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.song-info {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 240px;
  max-width: 240px;
  flex-shrink: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 4px;
  margin: -4px;
  border-radius: 8px;
}

.song-info:hover {
  background: rgba(255, 255, 255, 0.08);
}

.song-info:hover .album-cover {
  transform: scale(1.05);
}

.album-cover {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.info-text {
  flex: 1;
  min-width: 0;
}

.song-name {
  font-size: 15px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.artist-name {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

/* 移动端跑马灯效果 */
@media (max-width: 768px) {
  .song-name.marquee,
  .artist-name.marquee {
    overflow: hidden;
    position: relative;
    width: 100%;
    max-width: calc(100vw - 140px);
    mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
    -webkit-mask-image: linear-gradient(to right, transparent, black 20px, black calc(100% - 20px), transparent);
  }

  .song-name.marquee span,
  .artist-name.marquee span {
    display: inline-block;
    white-space: nowrap;
    animation: marquee 15s linear infinite;
    will-change: transform;
  }

  .song-name.marquee span::after,
  .artist-name.marquee span::after {
    content: '   •   ' attr(data-text);
  }

  @keyframes marquee {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }
}

.player-controls {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-shrink: 0;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.control-btn, .mode-btn, .fav-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn:hover, .mode-btn:hover, .fav-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.settings-selector {
  position: relative;
}

.settings-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.settings-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.settings-btn .icon-svg {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.settings-label {
  font-size: 13px;
  font-weight: 500;
}

.settings-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  background: rgba(26, 42, 50, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 12px;
  min-width: 240px;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1000;
  animation: slideUp 0.2s ease;
}

.settings-menu::-webkit-scrollbar {
  width: 4px;
}

.settings-menu::-webkit-scrollbar-track {
  background: transparent;
}

.settings-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.menu-section {
  margin-bottom: 8px;
}

.menu-section:last-child {
  margin-bottom: 0;
}

.menu-section-title {
  font-size: clamp(11px, 2.8vw, 12px);
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  padding: 0 6px;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.quality-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 4px;
}

.quality-option:last-child {
  margin-bottom: 0;
}

.quality-option:hover {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.95);
}

.quality-option.active {
  background: rgba(138, 190, 185, 0.2);
  color: #8ABEB9;
}

.option-label {
  font-size: clamp(12px, 3.2vw, 13px);
  font-weight: 500;
}

.option-desc {
  font-size: clamp(10px, 2.8vw, 11px);
  opacity: 0.7;
}

.volume-control-inline {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
}

.volume-icon-small {
  width: 18px;
  height: 18px;
  fill: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.volume-slider-inline {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  border-radius: 2px;
  outline: none;
  border: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

.volume-slider-inline::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  border: none;
}

.volume-slider-inline::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #8ABEB9;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: -4px;
}

.volume-slider-inline::-moz-range-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  border: none;
}

.volume-slider-inline::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #8ABEB9;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-value {
  font-size: clamp(11px, 3vw, 12px);
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
  min-width: 38px;
  text-align: right;
}

.play-btn {
  background: linear-gradient(135deg, #8ABEB9 0%, #B7E5CD 100%);
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  color: #305669;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(138, 190, 185, 0.4);
}

.play-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(138, 190, 185, 0.6);
}

.icon-svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
  display: block;
}

.play-btn .icon-svg {
  width: 20px;
  height: 20px;
}

.fav-btn.active {
  color: #C1785A;
}

.lyric-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.7;
  width: 40px;
  height: 40px;
}

.lyric-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
  opacity: 1;
}

.lyric-btn.active {
  opacity: 1;
  color: #1db954;
  background: rgba(29, 185, 84, 0.1);
}

.lyric-btn.locked {
  opacity: 1;
  color: #ff9800;
  background: rgba(255, 152, 0, 0.1);
}

.lyric-btn .icon-svg {
  width: 18px;
  height: 18px;
}

.share-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.share-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.1);
}

.share-btn .icon-svg {
  width: 18px;
  height: 18px;
  fill: currentColor;
}

.progress-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.75);
  min-width: 40px;
  text-align: center;
}

.progress-container {
  flex: 1;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
}

.progress-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  position: relative;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #8ABEB9 0%, #B7E5CD 100%);
  border-radius: 2px;
  transition: width 0.1s linear;
  pointer-events: none;
}

.progress-thumb {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 2;
}

.progress-thumb.dragging {
  transform: translate(-50%, -50%) scale(1.3);
  opacity: 1;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.4);
}

.progress-container:hover .progress-thumb {
  opacity: 1;
}

.progress-container:active .progress-thumb {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1.2);
}

.right-controls {
  display: flex;
  align-items: center;
  gap: 26px;
  flex-shrink: 0;
  min-width: 200px;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 140px;
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.7);
  background: transparent;
  padding: 0;
  margin: 0;
}

.volume-control .icon-svg {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.volume-control:hover {
  color: rgba(255, 255, 255, 0.9);
}

.playlist-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
}

/* 默认隐藏移动端按钮 */
.mobile-only {
  display: none;
}

/* 默认隐藏桌面端按钮 */
.desktop-only {
  display: flex;
}

/* 音质选择器（桌面端） */
.quality-selector {
  position: relative;
}

.quality-btn {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 20px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.quality-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.quality-label {
  font-size: 14px;
  font-weight: 600;
}

.quality-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  background: rgba(26, 42, 50, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  padding: 12px;
  min-width: 240px;
  max-width: 90vw;
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1000;
  animation: slideUp 0.2s ease;
}

.quality-menu::-webkit-scrollbar {
  width: 4px;
}

.quality-menu::-webkit-scrollbar-track {
  background: transparent;
}

.quality-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.playlist-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  transform: scale(1.05);
}

.playlist-btn.active {
  background: rgba(138, 190, 185, 0.2);
  color: #8ABEB9;
}

.playlist-btn .icon-svg {
  width: 20px;
  height: 20px;
}

.volume-slider {
  flex: 1;
  height: 4px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  background: transparent;
  border-radius: 2px;
  outline: none;
  border: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
  margin: 0;
  padding: 0;
  cursor: pointer;
}

/* 移除所有浏览器的焦点样式 */
.volume-slider:focus {
  outline: none;
  box-shadow: none;
  border: none;
}

.volume-slider:focus-visible {
  outline: none;
  box-shadow: none;
}

/* WebKit/Blink 浏览器 (Chrome, Safari, Edge) */
.volume-slider::-webkit-slider-runnable-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  border: none;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  background: #8ABEB9;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: -4px;
  -webkit-tap-highlight-color: transparent;
}

.volume-slider:focus::-webkit-slider-thumb {
  box-shadow: 0 2px 6px rgba(138, 190, 185, 0.4);
}

/* Firefox */
.volume-slider::-moz-range-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  border: none;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  background: #8ABEB9;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.volume-slider:focus::-moz-range-thumb {
  box-shadow: 0 2px 6px rgba(138, 190, 185, 0.4);
}

/* IE/Edge */
.volume-slider::-ms-track {
  width: 100%;
  height: 4px;
  background: transparent;
  border-color: transparent;
  color: transparent;
  border: none;
}

.volume-slider::-ms-fill-lower {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  border: none;
}

.volume-slider::-ms-fill-upper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  border: none;
}

.volume-slider::-ms-thumb {
  width: 12px;
  height: 12px;
  background: #8ABEB9;
  border-radius: 50%;
  cursor: pointer;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  margin-top: 0;
}

.volume-slider:focus::-ms-thumb {
  box-shadow: 0 2px 6px rgba(138, 190, 185, 0.4);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .music-player {
    padding: 8px 12px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  .player-content {
    flex-direction: column;
    gap: 8px;
  }

  .song-info {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding: 8px;
    margin: -8px;
  }

  .album-cover {
    width: 52px;
    height: 52px;
  }

  .song-name {
    font-size: 14px;
    max-width: calc(100vw - 140px);
  }

  .artist-name {
    font-size: 12px;
    max-width: calc(100vw - 140px);
  }

  .player-controls {
    width: 100%;
  }

  /* 移动端隐藏音质按钮，显示设置按钮 */
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: flex !important;
  }

  .control-buttons {
    gap: 4px;
    flex-wrap: nowrap;
    justify-content: center;
    margin-bottom: 4px;
  }

  /* 隐藏移动端不常用的按钮 */
  .share-btn {
    display: none;
  }

  /* 移动端显示设置按钮 */
  .settings-selector {
    display: block;
  }

  .control-btn, .mode-btn, .fav-btn {
    padding: 8px;
    min-width: 40px;
    min-height: 40px;
  }

  .icon-svg {
    width: 18px;
    height: 18px;
  }

  .play-btn {
    width: 52px;
    height: 52px;
    margin: 0 4px;
  }

  .play-btn .icon-svg {
    width: 22px;
    height: 22px;
  }

  .progress-bar {
    gap: 8px;
    margin-top: 4px;
  }

  .time {
    font-size: 11px;
    min-width: 38px;
  }

  .progress-container {
    padding: 10px 0;
  }

  .progress-bg {
    height: 5px;
  }

  .progress-thumb {
    width: 14px;
    height: 14px;
    opacity: 1;
  }

  .right-controls {
    width: 100%;
    justify-content: space-between;
    min-width: 0;
    gap: 12px;
    margin-top: 4px;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .volume-control {
    flex: 1;
    width: auto;
    min-width: 0;
  }

  .volume-control .icon-svg {
    width: 20px;
    height: 20px;
  }

  .playlist-btn {
    width: 40px;
    height: 40px;
    padding: 10px;
    flex-shrink: 0;
  }

  .playlist-btn .icon-svg {
    width: 20px;
    height: 20px;
  }

  /* 移动端隐藏桌面播放列表按钮 */
  .desktop-only {
    display: none !important;
  }

  /* 移动端显示移动播放列表按钮 */
  .mobile-only {
    display: flex !important;
  }
}

@media (max-width: 480px) {
  .music-player {
    padding: 8px 10px;
    padding-bottom: calc(8px + env(safe-area-inset-bottom));
  }

  .song-info {
    padding: 6px;
    margin: -6px;
  }

  .album-cover {
    width: 48px;
    height: 48px;
  }

  .song-name {
    font-size: 13px;
  }

  .artist-name {
    font-size: 11px;
  }

  .control-buttons {
    gap: 2px;
  }

  .control-btn, .mode-btn, .fav-btn {
    padding: 6px;
    min-width: 36px;
    min-height: 36px;
  }

  .icon-svg {
    width: 16px;
    height: 16px;
  }

  .play-btn {
    width: 48px;
    height: 48px;
    margin: 0 2px;
  }

  .play-btn .icon-svg {
    width: 20px;
    height: 20px;
  }

  .time {
    font-size: 10px;
    min-width: 35px;
  }

  .volume-control .icon-svg {
    width: 18px;
    height: 18px;
  }

  .playlist-btn {
    width: 36px;
    height: 36px;
    padding: 8px;
  }

  .playlist-btn .icon-svg {
    width: 18px;
    height: 18px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  .control-btn, .mode-btn, .fav-btn, .share-btn, .play-btn, .playlist-btn {
    min-width: 44px;
    min-height: 44px;
  }

  .progress-container {
    padding: 12px 0;
  }

  .progress-bg {
    height: 6px;
  }

  .progress-thumb {
    width: 16px;
    height: 16px;
    opacity: 1;
  }
}
</style>


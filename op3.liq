beatbox = single(id="fallback", "~/shared/beatbox.mp4")
firstEp = ref(true)

aac_hifi = %ffmpeg(
    format="mpegts",
    %audio(
        codec="aac",
        channels=2,
        ar=44100,
        b="192k"
    ),
    %video(
        codec="libx264",b="2600k",
        "x264-params"="scenecut=0:open_gop=0:min-keyint=150:keyint=150",
        preset="ultrafast"
    )
)
   
streams = [("aac_hifi", aac_hifi)]

def getNextEpisode() =
    nodeString = if !firstEp then "node getNextEpisode -f" else "node getNextEpisode" end
        firstEp := false
    request.create(list.hd(default="", process.read.lines(nodeString)))     
end

# Create the source
source = fallback(
    id="onepiece", track_sensitive=false, 
    [request.dynamic(id="onepiece", getNextEpisode), beatbox]
)

hlsStream = output.harbor.hls(
    fallible=true,
    segments_overhead=2,
    segment_duration=float(5),
    playlist="onepiece.m3u8",
    streams,
    port=8005,
    persist_at="./persist",
    #tmpdir="/root/shared/tmp",
    source
)

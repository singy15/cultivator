using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.VisualBasic;
using Microsoft.VisualBasic.FileIO;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace cultivator.webapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class FileSystemController : ControllerBase
    {
        public class FileSystemEntry
        {
            public string Path { get; set; }

            public string AbsPath { get; set; }

            public bool IsDirectory { get; set; }

            public string TextContents { get; set; }

            public string BinaryContentsBase64 { get; set; }
        }

        public class PathInfo
        {
            public string Path { get; set; }
        }

        public class FileOpInfo
        {
            public string PathSrc { get; set; }

            public string PathDst { get; set; }
        }

        public class ContentsInfo
        {
            public string Path { get; set; }

            public string TextContents { get; set; }

            public string BinaryContentsBase64 { get; set; }
        }

        public class RequestResult
        {
            public bool Success { get; set; }

            public string Message { get; set; }

            public int ErrorCode { get; set; }
        }


        private readonly ILogger<FileSystemController> _logger;

        public FileSystemController(ILogger<FileSystemController> logger)
        {
            _logger = logger;
        }

        // fetch("filesystem/api/entries", { method: "POST", body: JSON.stringify({ path: "c:\\" }), headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} }).then(r => r.json()).then(console.log)
        [Route("api/entries")]
        public IEnumerable<FileSystemEntry> PostEntries([FromBody] PathInfo pathInfo)
        {
            var targetDir = pathInfo.Path;

            var uri = new Uri(targetDir);

            if (!Directory.Exists(targetDir))
            {
                return new List<FileSystemEntry>();
            }

            var files = Directory.GetFiles(targetDir, "*", System.IO.SearchOption.TopDirectoryOnly)
                .Select(p => new FileSystemEntry()
                {
                    AbsPath = p,
                    Path = p.Replace(targetDir, ""),
                    IsDirectory = false,
                    TextContents = null,
                    BinaryContentsBase64 = null
                })
                .ToList();
            var dirs = Directory.GetDirectories(targetDir, "*", System.IO.SearchOption.TopDirectoryOnly)
                .Select(p => new FileSystemEntry()
                {
                    AbsPath = p,
                    Path = p.Replace(targetDir, ""),
                    IsDirectory = true,
                    TextContents = null,
                    BinaryContentsBase64 = null
                })
                .ToList();

            var ls = new List<FileSystemEntry>();
            ls.AddRange(dirs);
            ls.AddRange(files);

            return ls;
        }

        private FileSystemEntry GetEntry(string absPath)
        {
            var targetPath = absPath;

            var textContents = "";
            using (var sr = new StreamReader(targetPath/*, Encoding.UTF8*/))
            {
                textContents = sr.ReadToEnd();
            }

            var entry = new FileSystemEntry()
            {
                AbsPath = targetPath,
                Path = targetPath.Replace(Path.GetDirectoryName(targetPath), ""),
                TextContents = textContents,
                BinaryContentsBase64 = null
            };

            return entry;
        }

        // fetch("filesystem/api/contents", { method: "POST", body: JSON.stringify({ path: "c:\\foo.txt" }), headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} }).then(r => r.json()).then(console.log)
        [Route("api/contents")]
        public FileSystemEntry PostContents([FromBody] PathInfo pathInfo)
        {
            var targetPath = pathInfo.Path;
            return GetEntry(targetPath);
        }

        // fetch("filesystem/api/write", { method: "POST", body: JSON.stringify({ path: "c:\\foo.txt", textContents: "foobar" }), headers: {'Accept': 'application/json', 'Content-Type': 'application/json'} }).then(r => r.json()).then(console.log)
        [Route("api/write")]
        public FileSystemEntry PostWrite([FromBody] ContentsInfo contentsInfo)
        {
            var targetPath = contentsInfo.Path;
            var textContents = contentsInfo.TextContents;

            using (var sw = new StreamWriter(targetPath/*, Encoding.UTF8*/))
            {
                sw.Write(textContents);
            }

            return GetEntry(targetPath);
        }

        [Route("api/open-in-shell")]
        [EnableCors]
        public RequestResult PostOpenInShell([FromBody] PathInfo pathInfo)
        {
            var psi = new ProcessStartInfo()
            {
                FileName = pathInfo.Path,
                UseShellExecute = true
            };

            Process.Start(psi);

            return new RequestResult() { Success = true, Message = "", ErrorCode = 0 };
        }

        [Route("api/copy")]
        [EnableCors]
        public RequestResult PostCopy([FromBody] FileOpInfo fileOpInfo)
        {
            string copySrc = fileOpInfo.PathSrc;
            string copyDest = fileOpInfo.PathDst;

            if (Directory.Exists(copySrc))
            {
                copyDest = Path.Combine(copyDest, Path.GetFileName(copySrc));
                Microsoft.VisualBasic.FileIO.FileSystem.CopyDirectory(
                  copySrc, copyDest, UIOption.AllDialogs);
            }
            else { 
                copyDest = Path.Combine(copyDest, Path.GetFileName(copySrc));
                Microsoft.VisualBasic.FileIO.FileSystem.CopyFile(
                  copySrc, copyDest, UIOption.AllDialogs);
            }

            return new RequestResult() { Success = true, Message = "", ErrorCode = 0 };
        }

        [Route("api/move")]
        [EnableCors]
        public RequestResult PostMove([FromBody] FileOpInfo fileOpInfo)
        {
            string copySrc = fileOpInfo.PathSrc;
            string copyDest = fileOpInfo.PathDst;

            if (Directory.Exists(copySrc))
            {
                copyDest = Path.Combine(copyDest, Path.GetFileName(copySrc));
                Microsoft.VisualBasic.FileIO.FileSystem.MoveDirectory(
                  copySrc, copyDest, UIOption.AllDialogs);
            }
            else { 
                copyDest = Path.Combine(copyDest, Path.GetFileName(copySrc));
                Microsoft.VisualBasic.FileIO.FileSystem.MoveFile(
                  copySrc, copyDest, UIOption.AllDialogs);
            }

            return new RequestResult() { Success = true, Message = "", ErrorCode = 0 };
        }


    }
}

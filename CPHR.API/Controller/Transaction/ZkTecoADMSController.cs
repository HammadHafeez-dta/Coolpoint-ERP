using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;
using System.Collections.Concurrent;
using SaftHR.API.Interface.Transaction;
using SaftHR.API.Models.Machine;

namespace SaftHR.API.Controller.Transaction
{
    [Route("iclock")]
    [Route("api/v1/iclock")]
    [ApiController]
    public class ZkTecoADMSController : ControllerBase
    {
        private readonly IAttendanceService _attendanceService;
        private readonly ILogger<ZkTecoADMSController> _logger;

        // An in-memory queue to hold commands for specific Serial Numbers.
        private static readonly ConcurrentDictionary<string, ConcurrentQueue<string>> _commandQueue = new();
        private static int _commandIdCounter = 1;

        public ZkTecoADMSController(IAttendanceService attendanceService, ILogger<ZkTecoADMSController> logger)
        {
            _attendanceService = attendanceService;
            _logger = logger;
        }

        // --- 1. HANDSHAKE ---
        [HttpGet("cdata")]
        public IActionResult Handshake([FromQuery] string SN)
        {
            Console.WriteLine($"\n========================================================");
            Console.WriteLine($"[ADMS HANDSHAKE] Device Connected! Serial Number: {SN}");
            Console.WriteLine($"========================================================\n");
            _logger.LogInformation("[ADMS HANDSHAKE] Device Connected! Serial Number: {SN}", SN);

            string response = $"GET OPTION FROM:{SN}\nStamp=9999\nOpStamp=9999\nErrorDelay=60\nDelay=30\nTransTimes=00:00;14:00\nTransInterval=1\nTransFlag=1111000000\nTimeZone=05:00\nRealtime=1\nEncrypt=0\n";
            return Content(response, "text/plain");
        }

        // --- 2. RECEIVE DATA ---
        [HttpPost("cdata")]
        [Consumes("application/octet-stream", "text/plain", "application/json", "application/x-www-form-urlencoded", "multipart/form-data")]
        public async Task<IActionResult> ReceiveData([FromQuery] string SN, [FromQuery] string table, [FromQuery] string? machineId = null)
        {
            Console.WriteLine($"\n--------------------------------------------------------");
            Console.WriteLine($"[ADMS PUSH DATA] SN: {SN} | Table: {table} | MachineId: {machineId}");
            Console.WriteLine($"--------------------------------------------------------");
            _logger.LogInformation("[ADMS] Data Push - SN: {SN}, Table: {Table}, Length: {Length}, Type: {Type}",
                SN, table, Request.ContentLength, Request.ContentType);

            if (table == "ATTLOG")
            {
                Request.EnableBuffering();
                var recordsToImport = new List<Checkinout>();

                using (var reader = new StreamReader(Request.Body, Encoding.UTF8, leaveOpen: true))
                {
                    string? line;
                    while ((line = await reader.ReadLineAsync()) != null)
                    {
                        if (string.IsNullOrWhiteSpace(line)) continue;

                        _logger.LogInformation("[ADMS] Processing line: {Line}", line);

                        var parts = line.Split('\t');
                        if (parts.Length >= 4)
                        {
                            var userIdStr = parts[0];
                            var verifyDateStr = parts[1];
                            var verifyStateStr = parts[2];
                            var verifyTypeStr = parts[3];

                            if (int.TryParse(userIdStr, out int userId) &&
                                DateTime.TryParse(verifyDateStr, System.Globalization.CultureInfo.InvariantCulture, System.Globalization.DateTimeStyles.None, out DateTime verifyDate))
                            {
                                int.TryParse(verifyTypeStr, out int verifyCode);
                                int.TryParse(verifyStateStr, out int workCode);

                                string attendanceType = "I";
                                if (verifyStateStr == "1" || verifyStateStr == "O" || verifyStateStr == "out")
                                {
                                    attendanceType = "O";
                                }

                                recordsToImport.Add(new Checkinout
                                {
                                    Userid = userId,
                                    Checktime = verifyDate,
                                    Checktype = attendanceType,
                                    Verifycode = verifyCode,
                                    Sensorid = !string.IsNullOrEmpty(machineId) ? machineId : "1",
                                    Memoinfo = null,
                                    WorkCode = workCode,
                                    Sn = SN,
                                    UserExtFmt = 0
                                });

                                Console.WriteLine($"[ADMS RECORD RECEIVED] User ID: {userId} | Time: {verifyDate:yyyy-MM-dd HH:mm:ss} | Type: {attendanceType} | VerifyCode: {verifyCode} | Device SN: {SN}");
                                _logger.LogInformation("[ADMS] Successfully parsed punch: UserId={UserId}, Time={Time:yyyy-MM-dd HH:mm:ss}, Type={Type}, SN={SN}",
                                    userId, verifyDate, attendanceType, SN);
                            }
                            else
                            {
                                _logger.LogWarning("[ADMS] Failed to parse line. UserID='{UserIdStr}', VerifyDate='{VerifyDateStr}'", userIdStr, verifyDateStr);
                            }
                        }
                        else
                        {
                            _logger.LogWarning("[ADMS] Line has insufficient parts ({Length}): {Line}", parts.Length, line);
                        }
                    }
                }

                if (recordsToImport.Count > 0)
                {
                    try
                    {
                        _logger.LogInformation("[ADMS] Importing {Count} records directly to CHECKINOUT database table...", recordsToImport.Count);
                        await _attendanceService.ImportRawRecordsAsync(recordsToImport);
                        _logger.LogInformation("[ADMS] Successfully imported records.");
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "[ADMS] Error processing records: {Message}", ex.Message);
                    }
                }
                else
                {
                    _logger.LogWarning("[ADMS] No valid records found to import from the payload.");
                }
            }

            return Content("OK\n", "text/plain");
        }

        // --- 3. GET COMMANDS (Device polls this) ---
        [HttpGet("getrequest")]
        public IActionResult GetRequest([FromQuery] string SN)
        {
            if (_commandQueue.TryGetValue(SN, out var queue) && queue.TryDequeue(out var command))
            {
                int cmdId = System.Threading.Interlocked.Increment(ref _commandIdCounter);
                string response = $"C:{cmdId}:{command}\n";

                _logger.LogInformation("[ADMS] Sending Command to {SN}: {Response}", SN, response.Trim());
                return Content(response, "text/plain");
            }

            return Content("OK\n", "text/plain");
        }

        // --- 4. COMMAND RESULTS (Device posts success/fail here) ---
        [HttpPost("devicecmd")]
        public async Task<IActionResult> DeviceCommandResult([FromQuery] string SN)
        {
            using var reader = new StreamReader(Request.Body, Encoding.UTF8);
            var resultData = await reader.ReadToEndAsync();

            _logger.LogInformation("[ADMS] Command Result from {SN}: {ResultData}", SN, resultData);
            return Content("OK\n", "text/plain");
        }

        // --- 5. TRIGGER SYNC (Queue force sync command) ---
        [HttpPost("force-sync")]
        public IActionResult QueueForceSync([FromQuery] string SN)
        {
            if (string.IsNullOrWhiteSpace(SN))
                return BadRequest("Serial Number is required.");

            var queue = _commandQueue.GetOrAdd(SN, _ => new ConcurrentQueue<string>());

            string commandString = "DATA QUERY ATTLOG StartTime=2000-01-01 00:00:00 EndTime=2099-12-31 23:59:59";

            queue.Enqueue(commandString);

            return Ok(new { Message = $"Sync command successfully queued. The device ({SN}) will execute it on its next heartbeat." });
        }

        // --- 6. READ ATT LOG ---
        [HttpPost("read-attlog")]
        public IActionResult ReadAttLog([FromQuery] string SN, [FromQuery] string? startTime, [FromQuery] string? endTime)
        {
            if (string.IsNullOrWhiteSpace(SN))
                return BadRequest("Serial Number is required.");

            var queue = _commandQueue.GetOrAdd(SN, _ => new ConcurrentQueue<string>());

            string commandString;
            if (!string.IsNullOrEmpty(startTime) && !string.IsNullOrEmpty(endTime))
            {
                commandString = $"DATA QUERY ATTLOG StartTime={startTime} EndTime={endTime}";
            }
            else
            {
                commandString = "DATA QUERY ATTLOG";
            }

            queue.Enqueue(commandString);
            _logger.LogInformation("[ADMS] Queued ReadAttLog for {SN}: {CommandString}", SN, commandString);

            return Ok(new
            {
                Message = "Attendance log request queued. The device will push the data to the server on its next poll.",
                SN = SN,
                Command = commandString
            });
        }

        // --- 7. READ NEW LOG ---
        [HttpPost("read-new-log")]
        public IActionResult ReadNewLog([FromQuery] string SN)
        {
            if (string.IsNullOrWhiteSpace(SN))
                return BadRequest("Serial Number is required.");

            var queue = _commandQueue.GetOrAdd(SN, _ => new ConcurrentQueue<string>());

            string commandString = "CHECK";

            queue.Enqueue(commandString);
            _logger.LogInformation("[ADMS] Queued ReadNewLog (CHECK) for {SN}", SN);

            return Ok(new { Message = "Read New Log command (CHECK) queued successfully.", SN = SN });
        }
    }
}

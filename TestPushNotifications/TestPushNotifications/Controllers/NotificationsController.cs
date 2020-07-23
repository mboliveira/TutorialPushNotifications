using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.NotificationHubs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TestPushNotifications.Controllers
{
	[ApiController]
	[Route("[controller]")]
	public class NotificationsController : ControllerBase
	{
		private const string ConnectionString = ""; //TODO ADD CONNECTION STRING
		private const string NotificationHubPath = ""; //TODO ADD NOTIFICATION NAME

		private readonly ILogger<NotificationsController> _logger;

		public NotificationsController(ILogger<NotificationsController> logger)
		{
			_logger = logger;
		}



		[HttpPost("send")]
		public async Task RegisterDevice([FromBody] MessageDTO message)
		{
			var payload = new PushNotificationDTO()
			{
				Notification = new NotificationDTO() { Title = message.Title ?? string.Empty, Text = message.Text ?? string.Empty },
				Data = new DataDTO() { TagId = 1, UserId = 1 }
			};

			var serializedPayload = JsonConvert.SerializeObject(payload, new JsonSerializerSettings
			{
				Formatting = Formatting.Indented,
				ContractResolver = new CamelCasePropertyNamesContractResolver()
			});


			string tagExpression = "userId:1 && type:alarms";

			NotificationHubClient notificationHub = NotificationHubClient.CreateClientFromConnectionString(ConnectionString, NotificationHubPath);
			
			await notificationHub.SendFcmNativeNotificationAsync(serializedPayload, tagExpression);
		}




		[HttpPost("register")]
		public async Task RegisterDevice([FromBody] DeviceRegistrationDTO deviceRegistration)
		{
			NotificationHubClient notificationHub = NotificationHubClient.CreateClientFromConnectionString(ConnectionString, NotificationHubPath);

			string newRegistrationId = await GetAzureHubRegistrationId(notificationHub, deviceRegistration.PnsToken);

			// CREATES AN INSTANCE OF FIREBASE CLOUD MESSAGING
			RegistrationDescription registration = new FcmRegistrationDescription(deviceRegistration.PnsToken, new List<string> { "userId:1", "type:alarms" });
			registration.RegistrationId = newRegistrationId;

			// REGISTER DEVICE 
			await notificationHub.CreateOrUpdateRegistrationAsync(registration);
		}



		private async Task<string> GetAzureHubRegistrationId(NotificationHubClient notificationHub, string handle)
		{
			string newRegistrationId = null;

			if (!string.IsNullOrEmpty(handle))
			{
				var registrations = await notificationHub.GetRegistrationsByChannelAsync(handle, 10);

				foreach (var registration in registrations)
				{
					if (string.IsNullOrEmpty(newRegistrationId))
					{
						newRegistrationId = registration.RegistrationId;
					}
					else
					{
						await notificationHub.DeleteRegistrationAsync(registration);
					}
				}
			}

			if (string.IsNullOrEmpty(newRegistrationId))
			{
				newRegistrationId = await notificationHub.CreateRegistrationIdAsync();
			}

			return newRegistrationId;
		}
	}
}

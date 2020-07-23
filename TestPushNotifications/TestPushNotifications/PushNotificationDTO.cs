namespace TestPushNotifications
{
	public class PushNotificationDTO
	{
		public DataDTO Data { get; set; }
		public NotificationDTO Notification { get; set; }
	}

	public class NotificationDTO
	{
		public string Title { get; set; }
		public string Text { get; set; }

		/// <summary>
		/// Notification's sound. (Default value is "default" for both Android and IOS platforms)
		/// Without this attribute, the ringing or vibrating of notification may not work in some Android devices
		/// </summary>
		public string Sound { get; set; } = "default";

		/// <summary>
		/// Without this attribute, the vibrating of notification may not work in some Android devices 
		/// when they are in background and silence mode isn't active
		/// </summary>
		public string Android_channel_id { get; set; } = "PROGNOS_NOTIFICATION_CHANNEL_ID";
	}


	public class DataDTO
	{
		public int? TagId { get; set; }
		public int UserId { get; set; }
	}
}

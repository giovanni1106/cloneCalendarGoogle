var originCalendarId = '<ID>@group.calendar.google.com';
var cloneCalendarId = '<ID>@group.calendar.google.com';

function duplicateCalendarEvents() {
  var now = new Date();
  var threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  if (threeMonthsFromNow.getMonth() < now.getMonth()) {
    threeMonthsFromNow.setFullYear(threeMonthsFromNow.getFullYear() + 1);
  }

  var sourceEvents = CalendarApp.getCalendarById(originCalendarId).getEvents(now, threeMonthsFromNow);
  var targetEvents = CalendarApp.getCalendarById(cloneCalendarId).getEvents(now, threeMonthsFromNow);

  var createdEventCount = 0;
  var maxEvents = 60;

  for (var i = 0; i < sourceEvents.length; i++) {
    if (createdEventCount >= maxEvents) {
      break;
    }

    var event = sourceEvents[i];
    var title = event.getTitle();
    var startTime = event.getStartTime();
    var endTime = event.getEndTime();

    var isDuplicate = targetEvents.some(function(targetEvent) {
      return targetEvent.getTitle() === title &&
             targetEvent.getStartTime().getTime() === startTime.getTime() &&
             targetEvent.getEndTime().getTime() === endTime.getTime();
    });

    if (!isDuplicate) {
      let concatDescriptionWithGuests = function(description, guests){
        return description + '\n\n' + 'Convidados: \n' + guests;
      }(event.getDescription(), event.getGuestList().map(guest => guest.getEmail()).join());

      var options = {
        location: event.getLocation(),
        description: concatDescriptionWithGuests,
        //guests: event.getGuestList().map(guest => guest.getEmail()).join(),
        sendInvites: false
      };

      Logger.log('Event created: %s', title);
      Logger.log('Event startTime: %s', startTime);
      Logger.log('Event endTime: %s', endTime);
      Logger.log('Event description: %s', options.description);
      Logger.log('------------------------------------------');
      CalendarApp.getCalendarById(cloneCalendarId).createEvent(title, startTime, endTime, options);
      createdEventCount++;
    }
  }
}

function deleteEventsOldest(){
  var now = new Date();
  var threeMonthsFromNow = new Date(now);
  threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

  if (threeMonthsFromNow.getMonth() < now.getMonth()) {
    threeMonthsFromNow.setFullYear(threeMonthsFromNow.getFullYear() + 1);
  }

  let originalEvents = CalendarApp.getCalendarById(cloneCalendarId).getEvents(now, threeMonthsFromNow);
  let cloneEvents = CalendarApp.getCalendarById(originCalendarId).getEvents(now, threeMonthsFromNow);

  let eventsToDelete = originalEvents.filter(function(originalEvent){
    return !cloneEvents.some(function(cloneEvent){
      return cloneEvent.getTitle() === originalEvent.getTitle() &&
             cloneEvent.getStartTime().getTime() === originalEvent.getStartTime().getTime() &&
             cloneEvent.getEndTime().getTime() === originalEvent.getEndTime().getTime();
    });
  });

  eventsToDelete.forEach(function(event){
    event.deleteEvent();
    Logger.log('Event deleted: %s', event.getTitle());
  });
}


function getAllCalendars(){
  var calendars = CalendarApp.getAllOwnedCalendars();
  Logger.log('This user owns %s calendars.', calendars.length);

  Logger.log('--------------------------------------------')
  for (let i = 0; i < calendars.length; i++){
    Logger.log('Calendar name: %s', calendars[i].getName())
    Logger.log('Calendar id: %s', calendars[i].getId())
    Logger.log('--------------------------------------------')
  }
}

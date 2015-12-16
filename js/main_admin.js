/**
 * Created by Sz on 2015-04-28.
 */


    //check repeats, display appriopraite message according to repeat value from database
function dailyorweekly(repeat){
    if (repeat == 1){
        return "codziennie"
    }else if(repeat == 7){
        return "co tydzień"
    }else{
        return "jednorazowo"
    }
}
//get resourcename from database
function getResourceName(resourceID){

    var resource = null;
    $.ajax({
        cache: false,
        type: "POST",
        datatype: "json",
        url: "admin/process.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=getResourceName'+'&resourceID=' + resourceID,
        success: function (response) {
            resource = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystąpił następujący błąd przy pobraniu resourceName' + e.responseText);
        }

    });
    return resource.name;
}



//calendar stuff
$(document).ready(function(){
    /*****************************************************************************************************************
     *
     * Start the socket
     *
     ****************************************************************************************************************/

    var serverIP = '192.168.1.111';
    var serverPort = '3000';
    var socket = io.connect('http://'+serverIP+':'+serverPort);
    var disconnectTime =0;

    socket.connect();

    //try to reconnect when you disconnected(i.e. list wifi signal)
    socket.on('disconnect', function() {
        //toastr["error"]("Straciłeś połączenie z serwerem. Sprawdź połączenie z siecią bezprzewodową");
        socket.io.reconnect();

        return disconnectTime=moment().format('YYYY-MM-DD HH:mm:ss');

    });


    socket.on('reconnect', function() {

        //toastr["success"]("Wygląda na to, że połączenie wróciło. Sprawdź listę wiadomości i odswież plan");
        //TODO: prepare action after reconnecting i.e. info that you were disonnected and chek messages that you may missed
        //alert(disconnectTime+" czas rozłączenia")
        $.ajax({
            cache: false,
            type: "POST",
            datatype: "json",
            url: "admin/process.php",
            data: 'type=getInfoFromDb&disconnectTime='+disconnectTime,
            success: function (data) {
                var change = jQuery.parseJSON(data);

                if (change.length != 0)
                {
                    ion.sound.play("Facebook");

                    for(var i in change) {

                        //toastr["info"](change[i].message);
                        if (change[i].message.indexOf('odwołano')!=-1||change[i].message.indexOf('Odwołano')!=-1)
                        {
                            toastr["error"](change[i].message);
                        }
                        else
                        {
                            toastr["info"](change[i].message);
                        }

                    };
                    $('#calendar').fullCalendar('refetchEvents');
                }
                ion.sound.destroy("Facebook");
            }

        });


    });

    socket.on('message', function(msg){

        if (msg.indexOf('odwołano')!=-1||msg.indexOf('Odwołano')!=-1)
        {
            toastr["error"](msg);
        }
        else
        {
            toastr["info"](msg);
        }

        $('#calendar').fullCalendar('refetchEvents');
        ion.sound.play("Facebook");

    });

    socket.on('send', function (msg) {

    });

    /*****************************************************************************************************************
     *
     * message sending
     *
     ****************************************************************************************************************/
    $('#messagesButton').on('click', function () {

        $('#messageSubmitButton').prop('disabled', true);
        $('#messageModal').find('form')[0].reset();
        $('#messageModal').modal('show');
        $('#author').keyup(function () {
            $('#messageSubmitButton').prop('disabled', this.value == "" ? true : false);
        });

    });
    $('#messageSubmitButton').on('click', function () {
        var sender = $('#author').val();
        var messageContent = $('#messageContent').val();
        $('#messageModal').modal('hide');
        socket.send("Wiadomość od "+ sender +":  "+messageContent);

    });

    /*****************************************************************************************************************
     *
     * message processing inside modal window
     *
     ****************************************************************************************************************/
    $('#messagesListButton').on('click', function () {

        $('#messagesEventModal').modal('show');

        var $table = $('#messagesTable');
        $table.bootstrapTable('refresh');
        $table.bootstrapTable({
            url: 'admin/messagesManage.php',
            columns: [{
                field: 'messageid',
                title: 'ID',
                sortable: false
            }, {
                field: 'timedate',
                title: 'Data utworzenia',
                sortable: true
            }, {
                field: 'message',
                title: 'Treść wiadomości',
                sortable: false
            }]

        });

        $table.bootstrapTable('hideColumn', 'messageid');
    });
    /**********************************************************************************************************************
     * load resources with specific dates
     *
     *
     *********************************************************************************************************************/
    function loadResources() {
        var actualDate =  moment().format('e');
        //var actualDate = $('#calendar').fullCalendar('getDate');
        if (actualDate!=0)
        {
            actualDate = actualDate - 1;
        }
        //console.log(actualDate);
        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                //we need to remove values from dropdown
                $("#selectResource").empty();

                $.each(data, function (i, resource) {

                    $("#selectResource").append('<option value="' + resource.id + '"selected="selected">' + resource.name + '</option>');

                });

                $('#selectResource').multiselect('rebuild');

                $.each(data, function (i, resource) {
                    if (resource.workingDays.indexOf(actualDate) === -1) {
                        $("#selectResource").multiselect('deselect', resource.id);
                    }
                    //console.log(resource.workingDays);
                });

            },
            error: function (data) {
                alert(data);
            }

        });
        element.fullCalendar('render', true);
    }

    /*******************************************************************************************************************
     * check that resources availaibility in a viewed day
     *
     *******************************************************************************************************************/
    function checkResources() {
        var actualDate = $('#calendar').fullCalendar('getDate');
       // console.log(actualDate);
        actualDate = actualDate.format('e');
        //console.log(actualDate);
        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {

                $.each(data, function (i, resource) {
                    if (resource.workingDays.indexOf(actualDate) === -1) {
                        $("#selectResource").multiselect('deselect', resource.id)

                    }
                    else
                    {
                        $("#selectResource").multiselect('select', resource.id)

                    }

                    //console.log(resource.workingDays);
                });

                $('#calendar').fullCalendar('render', true);
            },
            error: function (data) {
                alert(data);
            }

        });

    }
    /*******************************************************************************************************************
     * need second function for load resources when refresh button is clicked,
     * this function have paramater with date freom calendar
     *
     *******************************************************************************************************************/

    function loadResources2(date) {

        var actualDate =  moment(date).format('e');
        //var actualDate = $('#calendar').fullCalendar('getDate');
        
        //console.log(actualDate)
        $.ajax({
            url: "admin/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                //we need to remove values from dropdown
                $("#selectResource").empty()

                $.each(data, function (i, resource) {

                    $("#selectResource").append('<option value="' + resource.id + '"selected="selected">' + resource.name + '</option>');

                });

                $('#selectResource').multiselect('rebuild');

                $.each(data, function (i, resource) {
                    if (resource.workingDays.indexOf(actualDate) === -1) {
                        $("#selectResource").multiselect('deselect', resource.id)
                    }
                    //console.log(resource.workingDays);
                });

            },
            error: function (data) {
                alert(data);
            }

        });
        element.fullCalendar('render', true);
    }


    /*******************************************************************************************************************
    * call check resources on each day,
    * need to call click prev next button
    *
     ******************************************************************************************************************/

    $('body').on('click', 'button.fc-prev-button', function(){
        checkResources()

    });

    $('body').on('click', 'button.fc-next-button', function(){
        checkResources()

    });

//set options for notification window
    toastr.options = {
        "closeButton": false,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-top-right",
        "preventDuplicates": true,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": 0,
        "extendedTimeOut": 0,
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut",
        "tapToDismiss": true
    }
    //configure multiselect plugin for view dropdown
    $('#selectView').multiselect({

        enableHTML: false,
        buttonClass: 'btn btn-default',
        inheritClass: false,
        buttonWidth: 'auto',
        buttonContainer: '<div class="btn-group" />',
        dropRight: false,
        selectedClass: 'active'

    });
//configure multiseletc plugin for resources dropdown
    $('#selectResource').multiselect({


        includeSelectAllOption: true,
        allSelectedText: 'Wszyscy widoczni',
        selectAllText: 'Pokaż wszystkich',
        nSelectedText: 'widocznych'




    });

    //click event for exporting calendar to excell, not working
    $('#exportButton').on('click', function () {
       // $('#calendar').fullCalendar('destroy');
        location.reload();
})

    //timepicker in modals for setting start and end of events
    $('.date').datetimepicker({
       // format: 'LT',
        locale: 'pl',
        format: 'HH:mm',
        stepping: '15',
        showClose: true,
        ignoreReadonly: true

    });


    //for resources filtering
    $('#selectResource').change(function(){

            element.fullCalendar('render', true);


    });
    $('#selectResource').load(function() {

            element.fullCalendar('render', true);

    });
/**********************for checking value checkboxes begin**************************/

function getRadioVal(form, name) {
    var val;
    // get list of radio buttons with specified name
    var radios = form.elements[name];

    // loop through list of radio buttons
    for (var i=0, len=radios.length; i<len; i++) {
        if ( radios[i].checked ) { // radio checked?
            val = radios[i].value; // if so, hold its value in val
            break; // and break out of for loop
        }
    }
    return val; // return value of checked radio or undefined if none checked
}

/**********************for checking value checkboxes end**************************/

//remove action for mouse right click
$('#calendar:not(".fc-event")').on('contextmenu', function (e) {

    e.preventDefault()
});
    var element = $('#calendar');

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();

    //detect mobile device
    var isWebkit = 'WebkitAppearance' in document.documentElement.style

    loadResources();

    //need add timeout because fullcalendar is loaded befor resources and this look bad
    setTimeout(function () {
        element.fullCalendar({

            //height: '100',
            //contentHeight:'9',
            //aspectRatio: '2.3',//<--this is for display 1600x900
            //aspectRatio: '1.6', //<--this is for display 1270x720
            //aspectRatio: '2.6', //<--this is for display 1024x600
            aspectRatio: '2.35',//<--this is for display galaxy tab 10

            header: {
                left: 'prev,next today',
                center: 'title',
                right: ''
            },
            lang: 'pl',
            defaultView: 'resourceDay',
            //defaultView:'agendaWeek',
            editable: true,
            droppable: true,
            selectable: true,
            selectHelper: true,
            minTime: "08:00:00",
            maxTime: "18:00:00",
            displayEventEnd: true,
            weekends: false,
            allDaySlot: false,
            allDayText:"urlop",
            eventTextColor: "black",
            unselectCancel: '.modal-dialog',
            lazyFetching: true,
            firstDay:  1,

            //define resource source
            resources: "admin/json-resources.php",

            //define events source
            events:
                {
                    url: "admin/json-events.php",
                    type: 'POST'

                },



    //resources filtering taken from github churchdesk/fullcalendar, star
   resourceFilter: function (resource) {

       var select1 = document.getElementById("selectResource");
       var selected1 = [];
       for (var i = 0; i < select1.length; i++) {
           if (select1.options[i].selected) selected1.push(select1.options[i].value);
       }

       return $.inArray(resource.id, selected1) > -1;
   },

   /******************************************************************************************************************
   * attemt to sort resources by sortID
   *
   *
   ******************************************************************************************************************/
   resourceSort: function SortByDescendingName(a, b) {
       var aName =  parseInt(a.sortID);
       var bName = parseInt(b.sortID);
       return ((aName > bName) ? 1 : ((aName < bName) ? -1 : 0));
   },


   //resources filtering taken from github churchdesk/fullcalendar, end
    viewRender: function(view, element) {

        //click date to go to the specific date, we use datepicker  and here specify initial values
        $('#customDateButton').off('click')
        $('#customDateButton').on('click', function (e) {

            var customDate = 0;
            $('#customDateButton').datepicker({
                weekStart: 1,
                todayHighlight: true,
                language: "pl",
                daysOfWeekDisabled: "0,6",
                autoclose: true,
                format: "yyyy-mm-dd"


            });
            $('#customDateButton').datepicker('show');
            $("#customDateButton").on("changeDate", function (event) {

                customDate = $("#customDateButton").datepicker('getFormattedDate')
               // console.log(customDate);
                $('#calendar').fullCalendar('gotoDate', customDate);
                checkResources()

            });
        });
        //click refresh view button
        $('#selectView-refresh').off('click');
        $('#selectView-refresh').on('click', function () {

            //code commented out on 26.09.2015 -- looks like nobody is using ext. view. Leave refresh button to reload reources
            /*//hold which view is selected from dropdown
            viewOption = $('#selectView option:selected').val();


            if (viewOption == 'viewStd') {

                //change row height for standard view
                element.find('.fc-slats td').css({"height": "2.5em"})
                //this allows to set new values
                $(window).resize();

            }
            else {

                //change row height for extended view
                element.find('.fc-slats td').css({"height": "6.5em"})
                //need this to see new row height
                $(window).resize();

            }*/
            var date = $('#calendar').fullCalendar('getDate');
           loadResources2(date)
            $('#calendar').fullCalendar('refetchEvents');
            //$('#calendar').fullCalendar('render', true);
        });

        //click print button
        $('#printButton').off('click')
        $('#printButton').on('click', function () {
            if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
            {
                BootstrapDialog.alert({
                    title: 'Uwaga',
                    message: 'funkcja druku nie jest wspierana na urzadzeniach mobilnych, wydrukuj to na kompie :)',
                    type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                    closable: true, // <-- Default value is false
                    draggable: true, // <-- Default value is false
                    buttonLabel: 'Zamknij' // <-- Default value is 'OK',
                });

            }
else {
                // after clicking height need to be adjusted to lanscape paper
                $('#calendar').fullCalendar('option', 'height', 'auto');
                //need to decrese row height to squize time from 8 to 17 on a4 paper
                element.find('.fc-slats td').css({"height": "2.3em"});

                //allows to see new values
                $(window).resize();

                //need to put print window into function otherwise view cannot change so quick, set timeout provide some delay
                setTimeout(function () {
                    window.print();
                }, 1000);

                //got from stackoverflow to refresh calendar after printing, don't know  what are variables here but works
                //but only in Chrome :(
                if (window.matchMedia) {
                    var mediaQueryList = window.matchMedia('print');
                    mediaQueryList.addListener(function (mql) {
                        if (!mql.matches) {

                            //need to remove option height to set aspect Ratio, clever :)
                            $('#calendar').fullCalendar('option', 'height', '');
                            //set aspect ratio
                            element.fullCalendar('option', 'aspectRatio', 2.3);
                            //set row height
                            element.find('.fc-slats td').css({"height": "2.5em"});


                        }
                    });
                }
            }

        });
    },

           //action when click on calendar to add new event
            // start
            //TODO: enable change date from form, maybe date picker?, how to display resource name rather than resource id
    select: function (start, end, jsEvent, view, resources) {

                
            BootstrapDialog.show({
                type: BootstrapDialog.TYPE_DANGER,
                closable: false,
                title: 'Uwaga',
                message: 'Wybierz odpowiednią opcję',

                buttons: [{
                    label: 'Nowe zajęcia',
                    cssClass: 'btn-success',
                    action: function (dialogItself) {
                        //set color for typical lesson
                        var category = 1;

                        dialogItself.close();
                        //reset form to the clear values
                        $('#createEventModal').find('form')[0].reset();
                        //human read start end and day

                        var starttime = $.fullCalendar.moment(start).format('HH:mm');
                        var endtime = $.fullCalendar.moment(end).format('HH:mm');
                        var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var resourcename = getResourceName(resources);
                        var resourceID = resources;

                        $('#createEventModal #event-date').val(eventdate);
                        $('#createEventModal #start-time').val(starttime);
                        $('#createEventModal #end-time').val(endtime);
                        $('#createEventModal #resourceID').val(resourcename);
                        $('#createEventModal').modal('show');

                        // assign function to onclick property of checkbox
                        //default we don't wanna see repeat-freq options
                        document.getElementById('repeatFreqDiv').style.display = 'none';
                        //now if we click repeats we schould see hidden options
                        document.getElementById('repeats').onclick = function () {
                            // access properties using this keyword
                            if (this.checked) {
                                document.getElementById('repeatFreqDiv').style.display = 'block';
                            } else {
                                //if repeats not checked we reset values and hide
                                $('input[name="repeat-freq"]').prop('checked', false);
                                document.getElementById('repeatFreqDiv').style.display = 'none';
                            }


                        };

                        //simple validation for title, just diable submit button if title is empty
                        $('#submitButton').prop('disabled', true);
                        $('#createEventModal #title').keyup(function () {
                            $('#submitButton').prop('disabled', this.value == "" ? true : false);
                        });


                        //fix for looping when add second third etc.. event
                        $('#submitButton').off('click')
                        //now when click submit on form
                        $('#submitButton').on('click', function (e) {
                            //we need title to print it on notification
                            var title = $('#createEventModal #title').val();
                            //there is problem with pass to php starttime and endtime from form,
                            //need to walkaround , so manually pass these two values to the PHP
                            var starttime2 = $('#createEventModal #start-time').val();
                            var endtime2 = $('#createEventModal #end-time').val();

                            //compare dates to check if range is corrcet
                            if (!(moment(starttime2, 'HH:mm').isBefore(moment(endtime2, 'HH:mm')))) {
                                alert("nie no bez jaj, ustaw poprawnie czas rozpoczecia i zakoczenia zajeć")
                                $('#submitButton').prop('disabled', true);
                            }
                            //if dates are correct do this
                            else {

                                $("#createEventModal").modal('hide');
                                // enh. add category for overhours
                                //check if checkbox is checked
                                if (document.getElementById('overhours').checked == true) {

                                    category = 5;
                                }
                                //just before sending the form we switching resource name to resource ID
                                $('#createEventModal #resourceID').val(resourceID);
                                e.preventDefault();
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    url: "admin/add-event.php",
                                    data: $('#createAppointmentForm').serialize() + "&category_id=" + category + "&start-time=" + starttime2 + "&end-time=" + endtime2,
                                    success: function () {

                                        $('#calendar').fullCalendar('unselect');
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+" dodano nowe zajęcia dla " + title +" w dniu "+ eventdate +" o godz "+ starttime);
                                        
                                       
                                    }

                                });
                            }
                        });


                    }


                }, {
                    label: 'Nowe badanie',
                    cssClass: 'btn-success',
                    action: function (dialogItself) {
                        //set color for study
                        var category = 2;

                        dialogItself.close();
                        //reset form to the clear values
                        $('#createStudyModal').find('form')[0].reset();
                        //human read start end and day

                        var starttime = $.fullCalendar.moment(start).format('HH:mm');
                        var endtime = $.fullCalendar.moment(end).format('HH:mm');
                        var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var resourcename = getResourceName(resources);
                        var resourceID = resources;
                        var mywhen = starttime + ' - ' + endtime + ' dnia: ' + eventdate + ' dla: ' + resourceID;
                        $('#createStudyModal #studyDate').val(eventdate);
                        $('#createStudyModal #studyStartTime').val(starttime);
                        $('#createStudyModal #studyEndTime').val(endtime);
                        $('#createStudyModal #studyResourceID').val(resourcename);
                        //$('#createStudyModal #studyDescription').val(event.description);
                        $('#createStudyModal').modal('show');


                        //fix for looping when add second third etc.. event
                        $('#study-submitButton').off('click')

                        //now when click submit on form
                        $('#study-submitButton').on('click', function (e) {
                            //we need title to print it on notification
                            var title = $('#createStudyModal #studyTitle').val();
                            // We don't want this to act as a link so cancel the link action
                            $("#createStudyModal").modal('hide');
                            //just before sending the form we switching resource name to resource ID
                            $('#createStudyModal #studyResourceID').val(resourceID);
                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin/add-study.php",
                                data: $('#createStudyForm').serialize() + "&category_id=" + category,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(resourcename+" dodano nowe badanie dla " + title +" w dniu "+ eventdate +" o godz "+ starttime);

                                }

                            });

                        });

                    }

                }, {
                    label: 'Przerwa',
                    cssClass: 'btn-success',
                    action: function (dialogItself) {

                        //set color for break
                        var category = 3;

                        dialogItself.close();
                        //reset form to the clear values
                        $('#createBreakModal').find('form')[0].reset();
                        //human read start end and day

                        var starttime = $.fullCalendar.moment(start).format('HH:mm');
                        var endtime = $.fullCalendar.moment(end).format('HH:mm');
                        var eventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var resourcename = getResourceName(resources);
                        var resourceID = resources;
                        var mywhen = starttime + ' - ' + endtime + ' dnia: ' + eventdate + ' dla: ' + resourceID;
                        $('#createBreakModal #breakDate').val(eventdate);
                        $('#createBreakModal #breakStartTime').val(starttime);
                        $('#createBreakModal #breakEndTime').val(endtime);
                        $('#createBreakModal #breakResourceID').val(resourcename);
                        $('#createBreakModal').modal('show');



                        //default we don't wanna see repeat-freq options
                        document.getElementById('breakRepeatFreqDiv').style.display = 'none';
                        //now if we click repeats we schould see hidden options
                        document.getElementById('breakRepeats').onclick = function () {
                            // access properties using this keyword
                            if (this.checked) {
                                document.getElementById('breakRepeatFreqDiv').style.display = 'block';
                            } else {
                                //if repeats not checked we reset values and hide
                                $('input[name="breakRepeatFreq"]').prop('checked', false);
                                document.getElementById('repeatFreqDiv').style.display = 'none';
                            }


                        };

                        //fix for looping when add second third etc.. event
                        $('#break-submitButton').off('click')

                        //now when click submit on form
                        $('#break-submitButton').on('click', function (e) {
                            // We don't want this to act as a link so cancel the link action
                            $("#createBreakModal").modal('hide');
                            //just before sending the form we switching resource name to resource ID
                            $('#createBreakModal #breakResourceID').val(resourceID);
                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin/add-break.php",
                                data: $('#BreakAppointmentForm').serialize() + "&category_id=" + category,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(resourcename +" masz nową przerwę dniu "+ eventdate +" w godz od"+ starttime +" do " + endtime);
                                }

                            });

                        });


                    }
                }, {
                    label: 'Urlop',
                    cssClass: 'btn-warning',
                    action: function (dialogItself) {
                        dialogItself.close();
                        //this will give different color for event leave
                        var category = 4;

                        //stuff for form
                        $('#createLeaveModal').find('form')[0].reset();
                        //default we create event for all day
                        var leavestarttime = moment().set({'hour': 08, 'minute': 00, 'second': 00}).format('HH:mm');
                        var leaveendtime = moment().set({'hour': 18, 'minute': 00, 'second': 00}).format('HH:mm');
                        var leaveeventdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var leaveTitle =  $('#createLeaveModal #leaveTitle').val();
                        var leaveresourcename = getResourceName(resources);
                        var leaveresourceID = resources;
                        //put values to the form

                        $('#createLeaveModal #leaveDate').val(leaveeventdate);
                        $('#createLeaveModal #leaveStartTime').val(leavestarttime);
                        $('#createLeaveModal #leaveEndTime').val(leaveendtime);
                        $('#createLeaveModal #leaveResourceID').val(leaveresourcename);

                        $('#createLeaveModal').modal('show');

                        //fix for looping when add second third etc.. event
                        $('#leaveSubmitButton').off('click')
                        //now when click submit on form
                        $('#leaveSubmitButton').on('click', function (e) {

                            //leave modal form does not work with form serialize, so to have speed up things, decided to put each value manually
                            var leavestarttime2 =  $('#createLeaveModal #leaveStartTime').val();
                            var leaveendtime2 = $('#createLeaveModal #leaveEndTime').val();
                            var leaveTitle =  $('#createLeaveModal #leaveTitle').val();

                            // We don't want this to act as a link so cancel the link action
                            $("#createLeaveModal").modal('hide');

                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin/add-leave.php",
                                data: "leaveTitle=" + leaveTitle +"&leaveDate=" + leaveeventdate +"&leaveStartTime=" + leavestarttime2 +"&leaveEndTime=" + leaveendtime2 +"&leaveResourceID=" + leaveresourceID + "&category_id=" + category,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(leaveresourcename +" nieobecność w dniu "+ leaveeventdate);

                                }
                            });
                        });
                    }
                },
                    //this is labelled as cancel
                    {
                    label: 'Anuluj',
                    action: function (dialogItself) {
                        dialogItself.close()
                        $('#calendar').fullCalendar('unselect');

                    }
                }
            ]
    });
        //added cancel class to the "cancel buutons in any modals to unselect uncreated event"
        $('.cancel').off('click')
        //now when click cancel on form
        $('.cancel').on('click', function (e) {

            $('#calendar').fullCalendar( 'unselect' );

        });



    },

            //prepare action when event has been clicked
    eventClick: function (event, jsEvent, view, resources) {

                //human readable values inside modal form, so we changing format
                var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
                var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
                var eventdate = $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
                var resourcename = getResourceName(event.resources);
                var resourceID = event.resources;
                var category_id = event.category_id;

                //below variables need go to the query to check if there is repeat for this event,
                var event_id = event.id;
                var parent_id = event.parent_id;
                var repeat_freq = event.repeat_freq;
                var title = event.title;
                var checkrepeats = dailyorweekly(repeat_freq);
                 $('#edit-submitButton').prop('disabled', false);
                 $('#delete-submitButton').prop('disabled', false);
                //distinction between break and normal lesson
                //this if is for break
                if (title == 'PRZERWA') {
                    $('#previewBreakModal #previewBreakTitle').val(event.title);
                    $('#previewBreakModal #previewBreakDate').val(eventdate);
                    $('#previewBreakModal #previewBreakStartTime').val(starttime);
                    $('#previewBreakModal #previewBreakEndTime').val(endtime);
                    $('#previewBreakModal #previewBreakResourceID').val(resourcename);
                    $('#previewBreakModal').modal('show');
                    //fix for looping when add second third etc.. event

                    $('#deleteBreakSubmitButton').off('click');

                    // if "delete button clicked on prewiev modal"
                    $('#deleteBreakSubmitButton').on('click', function () {
                       // console.log(repeat_freq);
                        $('#previewBreakModal').modal('hide');

                        //set default value for radio button, and it is single break delete
                        $('input[id="deleteBreakSingle"]').prop('checked', true);
                        //select visibility of elements. Need to be reproduced on another values!!!!!!!!!!!!!
                        if (repeat_freq == 0)
                        {
                            document.getElementById('divAllBreak').style.display = 'none';

                        }
                        else
                        {
                            document.getElementById('divAllBreak').style.display = 'block';
                        }
                        $("label[for='checkRepeatsLabel']").html("<strong>" + checkrepeats + "</strong>");
                        $('#deleteBreakeModal').modal('show');

                        //fix for looping when add second third etc.. event
                        $('#deleteBreakConfirmSubmitButton').off('click');

                        // if "delete button clicked on prewiev modal"
                        $('#deleteBreakConfirmSubmitButton').on('click', function () {

                            var deleteOption = getRadioVal(document.getElementById('deleteBreak'), 'deleteBreakOption');
                           // console.log(repeat_freq);
                            //console.log(deleteOption);


                            if (repeat_freq == 0)
                            {
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+ " Usunięto Twoją przerwę w dniu " +eventdate+" o godzinie " +starttime);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else if(repeat_freq != 0 && deleteOption == 'deleteBreakSingle')
                            {
                                //console.log(deleteOption);
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-child-event&event_id=' + event_id,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+ " Usunięto Twoją przerwę w dniu " +eventdate+" o godzinie " +starttime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })

                            }
                            else if(repeat_freq != 0 && deleteOption == 'deleteAllBreak')
                            {
                                $('#deleteBreakeModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+ " Usunięto Twoją przerwę w dniu " +eventdate+" o godzinie " +starttime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                        })
                 })
                }
                else {

                    //put values to modal
                    $('#previewEventModal #preview-title').val(event.title);
                    $('#previewEventModal #preview-event-date').val(eventdate);
                    $('#previewEventModal #preview-start-time').val(starttime);
                    $('#previewEventModal #preview-end-time').val(endtime);
                    $('#previewEventModal #preview-resourceID').val(resourcename);
                    $('#previewEventModal #preview-description').val(event.description);
                    //check if overhours checked or not
                    if(event.category_id == 5)
                    {

                        $('input[name="previewOverhours"]').prop('checked', true);
                    }
                    else
                    {

                        $('input[name="previewOverhours"]').prop('checked', false);
                    }
                    //check if event has been cancelled,
                    //if yes then need hide cancel event button, but we need show button to cancel cancel button
                    if(event.category_id == 6)
                    {

                        document.getElementById('cancelCancelSubmitButton').style.display = 'block';
                        document.getElementById('cancelSubmitButton').style.display = 'none';

                    }
                    //if not cancelled then we can simply enable this button
                    else
                    {
                        document.getElementById('cancelCancelSubmitButton').style.display = 'none';
                        document.getElementById('cancelSubmitButton').style.display = 'block';

                    }
                    //we also don't want to see cancel button nor cancel cancel when leave or break is current event
                    if(event.category_id == 3 || event.category_id == 4)
                    {

                        document.getElementById('cancelCancelSubmitButton').style.display = 'none';
                        document.getElementById('cancelSubmitButton').style.display = 'none';


                    }

                    document.getElementById('previewDescriptionButtons').style.display = 'none';
                    $('#preview-description').prop("readonly", true);
                    $('#previewEventModal').modal('show');

/*****************************************description processing begin*************************************************/
                $('#previewEventModal #preview-description').focus(function (e) {
                        e.preventDefault();
                        $('#preview-description').prop("readonly", false);
                        $('#edit-submitButton').prop('disabled', true);
                        $('#delete-submitButton').prop('disabled', true);
                        document.getElementById('previewDescriptionButtons').style.display = 'block';

                    });

                    $('#previewDescriptionButtonOK').off('click');
                    $('#previewDescriptionButtonOK').on('click', function () {
                        var description2json = $("#preview-description").val();
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin/process.php",
                            data: 'type=updateDescription&event_id=' + event_id + '&description=' + description2json,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send(resourcename+" dodano opis do zajęć dla " + event.title +" w dniu "+ eventdate +" o godz "+ starttime);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy dodawaniu opisu' + e.responseText);
                            }
                        })

                        $('#preview-description').prop("readonly", true);
                        document.getElementById('previewDescriptionButtons').style.display = 'none';
                        $('#edit-submitButton').prop('disabled', false);
                        $('#delete-submitButton').prop('disabled', false);
                    });

                    $('#previewDescriptionButtonCancel').off('click');
                    $('#previewDescriptionButtonCancel').on('click', function () {
                        $('#previewEventModal #preview-description').val(event.description);
                        $('#preview-description').prop("readonly", true);
                        document.getElementById('previewDescriptionButtons').style.display = 'none';
                        $('#edit-submitButton').prop('disabled', false);
                        $('#delete-submitButton').prop('disabled', false);

                    });


/*****************************************description processing end*************************************************/

                    //fix for looping when add second third etc.. event
                    $('#delete-submitButton').off('click');

                    // if "delete button clicked on prewiev modal"
                    $('#delete-submitButton').on('click', function () {

                        $('#previewEventModal').modal('hide');
                        //if there is a single event only
                        if (repeat_freq == 0) {

                            $('#deleteSingleEventModal').modal('show');

                            //problem:: sometime checkbox for deletion all events from day does not work, it deletes only single event
                            //fix: set default value
                            $('input[id="deleteChildEvent"]').prop('checked', true);
                            //fix for looping when add second third etc.. event
                            $('#deleteSingle-submitButton').off('click');

                            // if "delete button clicked" on sigle event deletion
                            $('#deleteSingle-submitButton').on('click', function () {

                                //variable to hold radio buttons values with options for deleting events
                                var deleteOption = getRadioVal(document.getElementById('deleteNoRepeats'), 'optionsRadio');

                                if (deleteOption == 'deleteSingle') {
                                    $('#deleteSingleEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id,
                                        success: function (response) {
                                            socket.send(resourcename+ ". Usunięto zajęcia dla " +event.title+" o godzinie " +starttime);
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                                else if (deleteOption == 'DeleteAllFromDay') {
                                    $('#deleteSingleEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-events-from-day&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&repeat_freq=' + repeat_freq,
                                        success: function (response) {
                                            //console.log(response.status);
                                            socket.send("Usunięto wszystkie zajęcia dla " +event.title+" w dniu " +eventdate);
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                            })
                        }
                        //if there is repeation
                        else if (repeat_freq != 0) {
                            //get value of repeats
                            var checkrepeats = dailyorweekly(repeat_freq);
                            //put retrieved repeats value to label on form
                            $("label[for='checkRepeatsLabel']").html("<strong>" + checkrepeats + "</strong>");

                            $('#deleteRepeateEventModal').modal('show');
                            //problem:: sometime checkbox for deletion all events from day does not work, it deletes only single event
                            //fix: set default value
                            $('input[id="deleteChildEventRepeate"]').prop('checked', true);

                            //fix for looping when add second third etc.. event
                            $('#deleteRepeate-submitButton').off('click');

                            // if "delete button clicked" on sigle event deletion
                            $('#deleteRepeate-submitButton').on('click', function () {


                                var deleteOptionRepeat = getRadioVal(document.getElementById('deleteYesRepeats'), 'optionsRadioRepeate');
                                //console.log(deleteOptionRepeat);
                                if (deleteOptionRepeat == 'deleteSingleRepeate') {
                                    //console.log(deleteOptionRepeat);
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-child-event&event_id=' + event_id,
                                        success: function (response) {
                                            socket.send(resourcename+ ". Usunięto zajęcia dla " +event.title+" o godzinie " +starttime);
                                            $('#calendar').fullCalendar('refetchEvents');

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                                else if (deleteOptionRepeat == 'DeleteAllFromDayRepeate') {
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-events-from-day&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&repeat_freq=' + repeat_freq,
                                        success: function (response) {
                                            socket.send("Usunięto wszystkie zajęcia dla " +event.title+" w dniu " +eventdate);
                                            //TODO: refetch does not work inside, why??
                                            $('#calendar').fullCalendar('refetchEvents');
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })

                                }
                                else if (deleteOptionRepeat == 'DeleteAllRepeate') {
                                    $('#deleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin/process.php",
                                        data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id +'&event_date=' + eventdate,
                                        success: function (response) {
                                            $('#calendar').fullCalendar('refetchEvents');
                                            socket.send("Usunięto wszystkie zajęcia dla " +event.title+" do końca roku");

                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })

                                }

                            });

                        }


                    });

                    var editStartTime = $.fullCalendar.moment(event.start).format('HH:mm');
                    var editEndTime = $.fullCalendar.moment(event.end).format('HH:mm');
                    //modify button clicked
                    //fix for looping when add second third etc.. event
                    $('#edit-submitButton').off('click');
                    $('#edit-submitButton').on('click', function () {

                        $('#previewEventModal').modal('hide');

                        //put values to modal
                        $('#editEventModal #edit-title').val(event.title);
                        $('#editEventModal #edit-event-date').val(eventdate);
                        $('#editEventModal #edit-start-time').val(starttime);
                        $('#editEventModal #edit-end-time').val(endtime);
                        $('#editEventModal #edit-resourceID').val(resourcename);
                        $('#editEventModal #edit-description').val(event.description);

                        var event_id = event.id;
                        var parent_id = event.parent_id;
                        var repeat_freq = event.repeat_freq;
                        var resourceID = event.resources;
                        var category_id = event.category_id;

                        var old_edit_title =  $('#editEventModal #edit-title').val(event.title);

                        //check if this event is overtime
                        if(event.category_id == 5)
                        {

                            $('input[name="editOverhours"]').prop('checked', true);
                        }
                        else
                        {

                            $('input[name="editOverhours"]').prop('checked', false);
                        }

                        //check if event is canelled or leave , if yes we should remove edit overtime,
                        if ( event.category_id == 6)
                        {
                            $('#editOverhours').prop('disabled', true);
                            $('#edit-confirm-submitButton').prop('disabled',true);
                            $('#editEventModal #edit-title').off('change');
                            $('#editEventModal #edit-title').change(function(){
                                $('#edit-confirm-submitButton').prop('disabled', false);
                                $('#editOverhours').prop('disabled', false);
                            });
                        }
                        else
                        {
                            $('#editOverhours').prop('disabled', false);
                            $('#edit-confirm-submitButton').prop('disabled',false);
                        }

                        $('#editEventModal').modal('show');

                    });
                    // todo:not working need to provide switching enable disable button when start/end time is changed
                    //but now change event is not fired don't know why


                    //$('#editEventModal #edit-end-time').off('change');
                    //$('#editEventModal #edit-end-time').change(function(){
                     //   $('#edit-confirm-submitButton').prop('disabled', false);

                    //});
                    //todo: check if start time is not smaller that end time

                    $('#edit-confirm-submitButton').off('click');
                    $('#edit-confirm-submitButton').on('click', function (e) {

                        editStartTime = $('#editEventModal #edit-start-time').val();
                        editEndTime = $('#editEventModal #edit-end-time').val();
                        $('#editEventModal').modal('hide');


                        //just before sending the form we switching resource name to resource ID
                        $('#editEventModal #edit-resourceID').val(resourceID);
                        e.preventDefault();

                        //if this edited event is converted from cancelled event, we modify only this event
                        if (category_id == 6) {
                            //check if overhours checkededitOverhours
                            if (document.getElementById('editOverhours').checked == true) {

                                category_id = 5;
                            }
                            else {
                                category_id = 1;
                            }
                            var editDescription = ''
                            $.ajax({
                                cache: false,
                                type: "POST",
                                datatype: "json",
                                url: "admin/update-event.php",
                                data: $('#editAppointmentForm').serialize() + '&type=cancel-event' + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&description=' + editDescription,
                                success: function (response) {
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(resourcename+ " zmodyfikowano zajęcia dla " +event.title+" w dniu " +eventdate+" o godzinie " +starttime);

                                },
                                error: function (e) {
                                    alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                }
                            });

                        }
                        else
                        {
                            //check if overhours checkededitOverhours
                            if (document.getElementById('editOverhours').checked == true) {

                                category_id = 5;
                            }
                            else {
                                category_id = 1;
                            }

                        //if there is a single event only
                        if (repeat_freq == 0) {
                            BootstrapDialog.confirm({
                                type: BootstrapDialog.TYPE_DANGER,
                                closable: false,
                                title: 'Uwaga',
                                message: 'Czy napewno zmodyfikować zajęcia?',
                                btnCancelLabel: 'Anuluj',
                                btnOKLabel: 'OK',
                                btnOKClass: 'btn-danger',
                                callback: function (result) {

                                    if (result == true) {
                                        //$('#editEventModal').modal('hide');
                                        $.ajax({
                                            cache: false,
                                            type: "POST",
                                            datatype: "json",
                                            url: "admin/update-event.php",
                                            data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                            success: function (response) {
                                                //$('#calendar').fullCalendar('refetchEvents');
                                                //TODO: refetch does not work inside, why??
                                                $('#calendar').fullCalendar('refetchEvents');
                                                socket.send(resourcename+ " zmodyfikowano zajęcia dla " +event.title+" w dniu " +eventdate+" o godzinie " +starttime);
                                            },
                                            error: function (e) {
                                                alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                            }
                                        })
                                    }
                                    else {
                                        //no need so far
                                        //dialogRef.close();
                                    }
                                }
                            })
                        }
                        //if there is repeation
                        else if (repeat_freq != 0) {
                            var checkrepeats = dailyorweekly(repeat_freq);

                            BootstrapDialog.show({
                                type: BootstrapDialog.TYPE_DANGER,
                                closable: false,
                                title: 'Uwaga',
                                message: 'Te zajęcia odbywają się ' + checkrepeats + ". Wybierz odpowienią opcję",

                                buttons: [{
                                    label: 'Zmień tylko te',
                                    cssClass: 'btn-success',
                                    action: function (dialogItself) {
                                        $.ajax({
                                            cache: false,
                                            type: "POST",
                                            datatype: "json",
                                            url: "admin/update-event.php",
                                            //here is something wrong with description
                                            data: $('#editAppointmentForm').serialize() + '&type=update-child-event' + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                            success: function (response) {
                                                $('#calendar').fullCalendar('refetchEvents');
                                                socket.send(resourcename+ " zmodyfikowano zajęcia dla " +event.title+" w dniu " +eventdate+" o godzinie " +starttime);

                                            },
                                            error: function (e) {
                                                alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                            }
                                        });
                                        dialogItself.close();
                                    }

                                }, {
                                    label: 'Zmień wszystkie',
                                    cssClass: 'btn-primary',
                                    action: function (dialogItself) {
                                        $.ajax({
                                            cache: false,
                                            type: "POST",
                                            datatype: "json",
                                            url: "admin/update-event.php",
                                            data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq=' + repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                            success: function (response) {
                                                $('#calendar').fullCalendar('refetchEvents');
                                                socket.send(resourcename+ " zmodyfikowano zajęcia dla " +event.title+" w dniu " +eventdate+" o godzinie " +starttime);

                                            },
                                            error: function (e) {
                                                alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                            }
                                        });
                                        dialogItself.close();
                                    }
                                }, {
                                    label: 'Anuluj',
                                    action: function (dialogItself) {
                                        dialogItself.close();
                                    }
                                }]
                            });
                        }
                    }
                    });


                    //click cancel event button
                    $('#cancelSubmitButton').off('click');
                    $('#cancelSubmitButton').on('click', function (e) {

                        $('#previewEventModal').modal('hide');

                        //reset form to the clear values
                        $('#cancelEventModal').find('form')[0].reset();
                        $('#cancelEventModal').modal('show');

                        //set default value for radio button, and it is single cancel
                        $('input[id="cancelChildEvent"]').prop('checked', true);

                        //confirm that you want cancel event
                        $('#cancelConfirmSubmitButton').off('click');
                        $('#cancelConfirmSubmitButton').on('click', function (e) {

                            //variable to hold radio buttons values with options for cancelling events
                            var cancelOption = getRadioVal(document.getElementById('cancelAppointmentForm'), 'cancelOptions');
                            var category_id = 6;
                            var description2json = $("#cancelDescription").val();

                            if (cancelOption == "cancelSingle")
                            {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=cancelEvent&event_id=' + event_id + '&description=NB:' + description2json + '&category_id=' +category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+ " odwołano zajęcia dla " +event.title+" w dniu " +eventdate+" o godzinie " +starttime);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy odwoływaniu zajęć' + e.responseText);
                                    }

                                })

                            }
                            else if (cancelOption == "cancelAllFromDay")
                            {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/process.php",
                                    data: 'type=cancelEventFromDay&event_date=' + eventdate + '&title=' + title + '&start_time=' + starttime + '&description= NB ' + description2json + '&category_id=' +category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send("Odwołano wszystkie zajęcia dla " +event.title+" w dniu " +eventdate);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy odwoływaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            $('#cancelEventModal').modal('hide');
                        });

                    })
                    //we can revert cancel event by clicking cancel cancel button
                    //click cancel event action
                    $('#cancelCancelSubmitButton').off('click');
                    $('#cancelCancelSubmitButton').on('click', function (e) {

                        //we switch to the normal event
                        var category_id = 1;
                        //and remove cancel reason from description
                        var trimedDescription = $("#preview-description").val();
                        var description2json = trimedDescription.split('NB:')[0];
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin/process.php",
                            data: 'type=cancelEvent&event_id=' + event_id + '&description=' + description2json + '&category_id=' +category_id,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                //console.log(response);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy anulowaniu odwołania zajęć' + e.responseText);
                            }

                        })
                        $('#previewEventModal').modal('hide');
                    });

                }
            },

         //when drag and drop existing event
    eventDrop: function(event, delta, revertFunc, resources) {
            var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
            var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
        //var endtime = $.fullCalendar.moment(event.start).add(delta,'ms').format('HH:mm');
            var eventdate =  $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
            var resourcename = getResourceName(event.resources);
            var resourceID = event.resources;
            $('#editEventModal #edit-title').val(event.title);
            $('#editEventModal #edit-event-date').val(eventdate);
            $('#editEventModal #edit-start-time').val(starttime);
            $('#editEventModal #edit-end-time').val(endtime);
            $('#editEventModal #edit-resourceID').val(resourcename);
            $('#editEventModal #edit-description').val(event.description);
            var event_id = event.id;
            var parent_id = event.parent_id;
            var repeat_freq = event.repeat_freq;
            var category_id = event.category_id;
        if(category_id == 5)
        {

            $('input[name="editOverhours"]').prop('checked', true);
        }
        else
        {

            $('input[name="editOverhours"]').prop('checked', false);
        }
            $('#editEventModal').modal('show');

            $('#edit-confirm-submitButton').off('click');
            $('#edit-confirm-submitButton').on('click', function() {
                var editStartTime = $('#editEventModal #edit-start-time').val()
                var editEndTime = $('#editEventModal #edit-end-time').val()
                $('#editEventModal').modal('hide');

                //check if overhours checkededitOverhours
                if (document.getElementById('editOverhours').checked == true) {

                    category_id = 5;
                }
                else
                {
                    category_id = event.category_id;
                }
                //just before sending the form we switching resource name to resource ID
                $('#editEventModal #edit-resourceID').val(resourceID);

                //if there is a single event only
                if (repeat_freq == 0) {
                    BootstrapDialog.confirm({
                        type: BootstrapDialog.TYPE_DANGER,
                        closable: false,
                        title: 'Uwaga',
                        message: 'Czy napewno zmodyfikować zajęcia?',
                        btnCancelLabel: 'Anuluj',
                        btnOKLabel: 'OK',
                        btnOKClass: 'btn-danger',
                        callback: function (result) {

                            if (result == true) {
                                //$('#editEventModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events'+'&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime+ '&category_id=' + category_id,
                                    success: function (response) {
                                        //$('#calendar').fullCalendar('refetchEvents');
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        //console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else{
                                $('#calendar').fullCalendar('refetchEvents');
                                //no need so far
                                //dialogRef.close();
                            }
                        }
                    })
                }
                //if there is repeation
                else if (repeat_freq != 0){
                    var checkrepeats = dailyorweekly(repeat_freq);
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_DANGER,
                        closable: false,
                        title: 'Uwaga',
                        message: 'Te zajęcia odbywają się ' + checkrepeats+ ". Wybierz odpowienią opcję",

                        buttons: [{
                            label: 'Zmień tylko te',
                            cssClass: 'btn-primary',
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-child-event'+'&event_id=' + event_id+ '&repeat_freq='+ repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+". Masz nowe zajęcia z "+event.title+" w dniu "+eventdate+ " o godz "+editStartTime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                    }
                                });
                                dialogItself.close();
                            }

                        }, {
                            label: 'Zmień wszystkie',
                            cssClass: 'btn-primary',
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq='+ repeat_freq  + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+". Masz nowe zajęcia z "+event.title+" w dniu "+eventdate+ " o godz "+editStartTime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                    }
                                });
                                dialogItself.close();
                            }
                        }, {
                            label: 'Anuluj',
                            action: function(dialogItself){
                                dialogItself.close();
                                $('#calendar').fullCalendar('refetchEvents');
                            }
                        }]
                    });
                }
            });
            //need to back to before changes when "Zamknij" button pressed
            $('#edit-close-submitButton').off('click');
            $('#edit-close-submitButton').on('click', function(){
                $('#calendar').fullCalendar('refetchEvents');
            });
        },

        //when resize existing event
    eventResize: function(event, delta, revertFunc, resources) {
            var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
            var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
            var eventdate =  $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
            var resourcename = getResourceName(event.resources);
            var resourceID = event.resources;
            $('#editEventModal #edit-title').val(event.title);
            $('#editEventModal #edit-event-date').val(eventdate);
            $('#editEventModal #edit-start-time').val(starttime);
            $('#editEventModal #edit-end-time').val(endtime);
            $('#editEventModal #edit-resourceID').val(resourcename);
            $('#editEventModal #edit-description').val(event.description);
            var event_id = event.id;
            var parent_id = event.parent_id;
            var repeat_freq = event.repeat_freq;
            var category_id = event.category_id;
        //set checkbutton according to actual value
        if(category_id == 5)
        {

            $('input[name="editOverhours"]').prop('checked', true);
        }
        else
        {

            $('input[name="editOverhours"]').prop('checked', false);
        }
            $('#editEventModal').modal('show');
            $('#edit-confirm-submitButton').off('click');
            $('#edit-confirm-submitButton').on('click', function() {
                var editStartTime = $('#editEventModal #edit-start-time').val()
                var editEndTime = $('#editEventModal #edit-end-time').val()
                $('#editEventModal').modal('hide');
                //check if overhours checkededitOverhours
                if (document.getElementById('editOverhours').checked == true) {

                    category_id = 5;
                }
                else
                {
                    category_id = event.category_id;
                }

                //just before sending the form we switching resource name to resource ID
                $('#editEventModal #edit-resourceID').val(resourceID);

                //if there is a single event only
                if (repeat_freq == 0) {
                    BootstrapDialog.confirm({
                        type: BootstrapDialog.TYPE_DANGER,
                        closable: false,
                        title: 'Uwaga',
                        message: 'Czy napewno zmodyfikować zajęcia?',
                        btnCancelLabel: 'Anuluj',
                        btnOKLabel: 'OK',
                        btnOKClass: 'btn-danger',
                        callback: function (result) {

                            if (result == true) {
                                //$('#editEventModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events'+'&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime+ '&category_id=' + category_id,
                                    success: function (response) {
                                        //$('#calendar').fullCalendar('refetchEvents');
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourcename+". Masz nowe zajęcia z "+event.title+" w dniu "+eventdate+ " o godz "+editStartTime);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikowaniu zajęć' + e.responseText);
                                    }
                                })
                            }
                            else{
                                $('#calendar').fullCalendar('refetchEvents');
                                //no need so far
                                //dialogRef.close();
                            }
                        }
                    })
                }
                //if there is repeation
                else if (repeat_freq != 0){
                    var checkrepeats = dailyorweekly(repeat_freq);
                    BootstrapDialog.show({
                        type: BootstrapDialog.TYPE_DANGER,
                        title: 'Uwaga',
                        closable: false,
                        message: 'Te zajęcia odbywają się ' + checkrepeats+ ". Wybierz odpowienią opcję",

                        buttons: [{
                            label: 'Zmień tylko te',
                            cssClass: 'btn-primary',
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-child-event'+'&event_id=' + event_id+ '&repeat_freq='+ repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        //console.log(response);
                                        socket.send(resourcename+". Masz nowe zajęcia z "+event.title+" w dniu "+eventdate+ " o godz "+editStartTime);

                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd modyfikacji zajęć' + e.responseText);
                                    }
                                });
                                dialogItself.close();
                            }

                        }, {
                            label: 'Zmień wszystkie',
                            cssClass: 'btn-primary',
                            action: function(dialogItself){
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin/update-event.php",
                                    data: $('#editAppointmentForm').serialize()+'&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq='+ repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                    success: function (response) {
                                        $('#calendar').fullCalendar('refetchEvents');
                                        if (response.status == "success")
                                        //TODO: refetch does not work inside, why??
                                        //$('#calendar').fullCalendar('refetchEvents');
                                            socket.send(resourcename+". Masz nowe zajęcia z "+event.title+" w dniu "+eventdate+ " o godz "+editStartTime);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy modyfikacji zajęć' + e.responseText);
                                    }
                                });
                                dialogItself.close();
                            }
                        }, {
                            label: 'Anuluj',
                            action: function(dialogItself){
                                dialogItself.close();
                                $('#calendar').fullCalendar('refetchEvents');
                            }
                        }]
                    });
                }
            });
            //need to back to before changes when "Zamknij" button pressed
            $('#edit-close-submitButton').off('click');
            $('#edit-close-submitButton').on('click', function(){
                $('#calendar').fullCalendar('refetchEvents');
            });

        },
            

    eventRender: function (event, element) {

        /***************************************************************************************************************
         * enable dragg option for touch devices
         *
         ***************************************************************************************************************/
        $(element).addTouch();

            //disable moving break for now :)
            if (event.title == 'PRZERWA') {

                event.editable = false;
            }
        //disable moving cancelled events
        if (event.category_id == 6) {

            event.editable = false;
            /**********************************************************************************************************
            *workaround for printing cancelled events,
            *we cannot use background propoerty because it will no print
            *we need to use img src as background and add this to .fc-bg, so far so good :)
            ********************************************************************************************************/
            element.css('background', "none");
            element.find('.fc-bg').append('<img src ="/images/cancel2.png" width=100% height=100%/>');
        }

            //this  is fix for appearing icons during selecting new event
            if (event.repeat_freq == null) {

                element.find('.fc-time').append('');
            }
            //glyphicon should appear only when event is created and it is reccurent
            else if(event.repeat_freq != 0)
            {
                element.find('.fc-time').append(' <span class="glyphicon glyphicon-refresh"></span>');
            }


        element.find('.fc-title').append("<br/>" + event.description);

        //this  is fix for appearing custom border during selecting new event
            if (event.description == null ) {

                element.css('border-color', '#FFFFFF');


            }
            //red border should appear only when event is created and it has description
            //"!= null" -- this does not work probably after adding new event there is empty text but not null
            else if (event.description != '')
            {
                element.css('border-color', '#ff000f');

            }

        //to have more readable events and see spaces between events in column wee add small margin to events
        $(element).css("margin-bottom", "2px");

        /**************************************************************************************************************
         * highlight all events titile to blue with the same title when event is pressed longer.
         **************************************************************************************************************/
        element.bind('taphold', function (e) {

                //get day viewed
                var currentViewDate = $('#calendar').fullCalendar('getDate')

                var events = $('#calendar').fullCalendar('clientEvents', function (event) {
                    //get list of events for displayed day
                    if (moment(event.start).format('YYYY-MM-DD') == currentViewDate.format('YYYY-MM-DD')) {
                        return true;
                    }
                });

                //search events with the same title as event where is mouse over
                for (var i = 0; events.length > i; i++) {

                    if (events[i].title == event.title) {
                        events[i].textColor = 'blue'
                    }
                    else{
                        events[i].textColor = ''
                    }
                }
                $('#calendar').fullCalendar("rerenderEvents");


        });

        }


    });
        /**************************************************************************************************************
         * checking resources when today button clicked, this need to be after loading fullcalendar
         * explanation under link http://stackoverflow.com/questions/27193160/affecting-fullcalendar-today-button-fc-today-button
         *
         **************************************************************************************************************/

        $(".fc-today-button").click(function() {
            checkResources();


        });
    }, 1000);

    /*********************************************autocomplete for title start ***********************/

    $('#createEventModal #title').typeahead({
     source: function (query, process) {
     $.ajax({
     url: "admin/temp_autocomplete.php",
     type: 'POST',
     dataType: 'JSON',
     data: 'query=' + query,
     success: function(data) {
     process(data);
          //console.log(data);
     }
     });
     }
     });

    $('#editEventModal #edit-title').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'type=nameAutocomplete&query=' + query,
                success: function(data) {
                    process(data);
                   // console.log(data);
                }
            });
        }
    });

    $('#createStudyModal #studyTitle').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'type=nameAutocomplete&query=' + query,
                success: function(data) {
                    process(data);
                   // console.log(data);
                }
            });
        }
    });
    /**********************************************autocomplete for title end******************************************/

    /**********************************************about window start******************************************/
    $('#aboutButton').off('click')
    $('#aboutButton').on('click', function () {
        BootstrapDialog.alert({
            title: 'O programie',
            message: 'Szczepan Rudnicki, szczepan.rudnicki@gmail.com, 2015',
            type: BootstrapDialog.TYPE_WARNING, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
            closable: true, // <-- Default value is false
            draggable: true, // <-- Default value is false
            buttonLabel: 'Zamknij' // <-- Default value is 'OK',
        });



    });


    /**********************************************about window end******************************************/
});

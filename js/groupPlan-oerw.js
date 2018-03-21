

 /* Created by Sz on 2015-04-28.
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
        url: "admin-oerw/process.php",
        //async: false, danger, don't know what how it will dangerous!!!!!
        async: false,
        data: 'type=getResourceNameForGroup'+'&resourceID=' + resourceID,
        success: function (response) {
            resource = jQuery.parseJSON(response);

        },
        error: function (e) {
            alert('Wystąpił następujący błąd przy pobraniu resourceName' + e.responseText);
        }

    });
    return resource.name;
}
 //get resourcegroup from database
 function getResourceGroup(resourceID){

     var resource = null;
     $.ajax({
         cache: false,
         type: "POST",
         datatype: "json",
         url: "admin-oerw/process.php",
         //async: false, danger, don't know what how it will dangerous!!!!!
         async: false,
         data: 'type=getResourceNameForGroup'+'&resourceID=' + resourceID,
         success: function (response) {
             resource = jQuery.parseJSON(response);

         },
         error: function (e) {
             alert('Wystąpił następujący błąd przy pobraniu resourceName' + e.responseText);
         }

     });
     return resource.groupName;
 }

 //get teacher ID
 function getTeacherId(name){

     var resource = null;
     $.ajax({
         cache: false,
         type: "POST",
         datatype: "json",
         url: "admin-oerw/process.php",
         //async: false, danger, don't know what how it will dangerous!!!!!
         async: false,
         data: 'type=getTeacherId'+'&name=' + name,
         success: function (response) {
             resource = jQuery.parseJSON(response);

         },
         error: function (e) {
             alert('Wystąpił następujący błąd przy pobraniu resourceName' + e.responseText);
         }

     });
     return resource.id;
 }
//calendar stuff
$(document).ready(function(){
    /*****************************************************************************************************************
     *
     * Start the socket
     *
     ****************************************************************************************************************/

    var serverIP = '192.168.1.33';
    var serverPort = '4000';
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
            url: "admin-oerw/process.php",
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
                        else if (change[i].message.indexOf('Wiadomość')!=-1)
                        {
                            toastr["warning"](change[i].message);
                        }
                        else
                        {
                            toastr["info"](change[i].message);
                        }

                    }
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
        else if (msg.indexOf('Wiadomość od')!=-1)
        {
            toastr["warning"](msg);
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
            url: 'admin-oerw/messagesManage.php',
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
            url: "admin-oerw/json-resources.php",
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
            url: "admin-oerw/json-resources.php",
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

    function loadResources2() {
        var actualDate = $('#calendar').fullCalendar('getDate');
        actualDate =  actualDate.format('e');
        //var actualDate = $('#calendar').fullCalendar('getDate');

        console.log(actualDate);
        $.ajax({
            url: "admin-oerw/json-resources.php",
            type: 'GET',
            //async: false,
            dataType: 'json',
            success: function (data) {
                //we need to remove values from dropdown
                $("#selectResource").empty();

                $.each(data, function (i, resource) {

                    //if teacher does not work this day set disable option
                    if (resource.workingDays.indexOf(actualDate) === -1)
                    {
                        $("#selectResource").append('<option value="' + resource.id + '"disabled>' + resource.name + '</option>');
                    }
                    //otherwise allow to select
                    else
                    {
                        $("#selectResource").append('<option value="' + resource.id + '">' + resource.name + '</option>');
                    }


                });

                $('#selectResource').multiselect("rebuild");


            },
            error: function (data) {
                alert(data);
            }

        });

    }


    /*******************************************************************************************************************
    * call check resources on each day,
    * need to call click prev next button
    *
     ******************************************************************************************************************/

    $('body').on('click', 'button.fc-prev-button', function(){
        //sz
        // checkResources()

    });

    $('body').on('click', 'button.fc-next-button', function(){
        //sz
        // checkResources()

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
    };
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
    $('#selectGroup').multiselect({

    });
    $('#selectResource').multiselect({
        buttonWidth: '200px',
        dropRight: true

    });

    //click event for exporting calendar to excell, not working
    $('#exportButton').on('click', function () {
       // $('#calendar').fullCalendar('destroy');
        location.reload();
});

    //timepicker in modals for setting start and end of events
    $('.date').datetimepicker({
       // format: 'LT',
        locale: 'pl',
        format: 'HH:mm',
        stepping: '15',
        showClose: true,
        ignoreReadonly: true

    });

    $('#leaveStartDate').datetimepicker({
        locale: 'pl',
        format: 'YYYY-MM-DD',
        viewMode: 'days',
        showClose: true,
        ignoreReadonly: true
    });
    $('#leaveEndDate').datetimepicker({
        useCurrent: false, //Important! See issue #1075
        locale: 'pl',
        format: 'YYYY-MM-DD',
        viewMode: 'days',
        showClose: true,
        ignoreReadonly: true
    });
    $("#leaveStartDate").on("dp.change", function (e) {
        $('#leaveEndDate').data("DateTimePicker").minDate(e.date);
        $('#createLeaveModal #leaveEndDate').val('');

    });
    $('#studyStartDate').datetimepicker({
        locale: 'pl',
        format: 'YYYY-MM-DD',
        viewMode: 'days',
        showClose: true,
        ignoreReadonly: true
    });
    $('#studyEndDate').datetimepicker({
        useCurrent: false, //Important! See issue #1075
        locale: 'pl',
        format: 'YYYY-MM-DD',
        viewMode: 'days',
        showClose: true,
        ignoreReadonly: true
    });
    $("#studyStartDate").on("dp.change", function (e) {
        $('#studyEndDate').data("DateTimePicker").minDate(e.date);
        $('#studyEndDate').val('');

    });
    //configure sounds
    ion.sound({
        sounds: [
            {name: "Facebook"}
        ],

        path: "sounds/",
        preload: true,
        multiplay: false,
        volume: 1
    });


    //for resources filtering
    $('#selectGroup').change(function(){

            element.fullCalendar('render', true);


    });
    $('#selectGroup').load(function() {

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
//$('#calendar:not(".fc-event")').on('contextmenu', function (e) {
//
//    e.preventDefault()
//});
    var element = $('#calendar');

    var date = new Date();
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var group  = "A";
    //detect mobile device
    var isWebkit = 'WebkitAppearance' in document.documentElement.style;

    //loadResources();

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
            allDayText:"cały dzień",
            eventTextColor: "black",
            unselectCancel: '.modal-dialog',
            lazyFetching: true,
            firstDay:  1,

            //define resource source
            resources: "admin-oerw/json-resources-group.php",
            //define resources

            events:
            {
                url: "admin-oerw/select-group-plan.php",
                type: "POST"
            },



    //resources filtering taken from github churchdesk/fullcalendar, star
   resourceFilter: function (resource) {

       var select1 = $("#selectGroup").val();
       console.log(select1);
       return $.inArray(resource.groupName, select1) > -1;


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

   eventAfterAllRender: function (view) {

     if (document.getElementById('bigScreenCalendar').checked == true) {
           $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
           //experimental, change row height
           $('#calendar').find('.fc-slats td').css({"height": "3.2em"});
           $(window).resize();
           //console.log('checked')
       }
       else {

           $('#calendar').find('.fc-slats td').css({"height": "2.5em"});
           $(window).resize();
       }


   },

   //resources filtering taken from github churchdesk/fullcalendar, end
    viewRender: function(view, element) {


        //click date to go to the specific date, we use datepicker  and here specify initial values
        $('#customDateButton').off('click');
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

                customDate = $("#customDateButton").datepicker('getFormattedDate');
               // console.log(customDate);
                $('#calendar').fullCalendar('gotoDate', customDate);
                //sz
                //checkResources()

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
            //var date = $('#calendar').fullCalendar('getDate');
            loadResources2();

        });

        //click print button
        $('#printButton').off('click');
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
                            if (document.getElementById('bigScreenCalendar').checked == true)
                            {
                                $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
                                $('#calendar').find('.fc-slats td').css({"height": "3.2em"});
                            }
                            else
                            {
                                //set aspect ratio
                                element.fullCalendar('option', 'aspectRatio', 2.35);
                                //set row height
                                element.find('.fc-slats td').css({"height": "2.5em"});
                            }
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
                        loadResources2(date);
                        $('#createEventModal #title').val(resourcename);
                        $('#createEventModal #event-date').val(eventdate);
                        $('#createEventModal #start-time').val(starttime);
                        $('#createEventModal #end-time').val(endtime);
                        $('#createEventModal #selectResource');
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

                        //fix for looping when add second third etc.. event
                        $('#submitButton').off('click');
                        //now when click submit on form
                        $('#submitButton').on('click', function (e) {
                            //we need title to print it on notification
                            var title = $('#createEventModal #title').val();
                            //there is problem with pass to php starttime and endtime from form,
                            //need to walkaround , so manually pass these two values to the PHP
                            var starttime2 = $('#createEventModal #start-time').val();
                            var endtime2 = $('#createEventModal #end-time').val();
                            var resourceID2 =  $('#selectResource option:selected').val();
                            var resourceName = $('#selectResource').find('option:selected').text();
                            //compare dates to check if range is corrcet
                            if (!(moment(starttime2, 'HH:mm').isBefore(moment(endtime2, 'HH:mm')))) {
                                alert("nie no bez jaj, ustaw poprawnie czas rozpoczecia i zakoczenia zajeć");
                                $('#submitButton').prop('disabled', true);
                                e.preventDefault();
                            }
                            //if dates are correct do this
                            else {

                                $("#createEventModal").modal('hide');
                                // enh. add category for overhours
                                //check if checkbox is checked
                                if (document.getElementById('overhours').checked == true) {

                                    category = 5;
                                }

                                e.preventDefault();
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    url: "admin-oerw/add-event.php",
                                    data: $('#createAppointmentForm').serialize() + "&category_id=" + category + "&start-time=" + starttime2 + "&end-time=" + endtime2 + "&resourceID=" + resourceID2,
                                    success: function () {

                                        $('#calendar').fullCalendar('unselect');
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourceName + " dodano nowe zajęcia dla " + title +" w dniu "+ eventdate +" o godz "+ starttime);
                                        
                                       
                                    }

                                });
                            }
                        });


                    }


                }, {
                    label: 'Zajęcia grupowe',
                    cssClass: 'btn-success',
                    action: function (dialogItself) {
                        //set color for study
                        var category = 7;

                        dialogItself.close();
                        //reset form to the clear values
                        $('#createStudyModal').find('form')[0].reset();
                        //human read start end and day

                        var starttime = $.fullCalendar.moment(start).format('HH:mm');
                        var endtime = $.fullCalendar.moment(end).format('HH:mm');
                        var eventstartdate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var eventenddate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var resourcegroup = getResourceGroup(resources);
                        var resourceID = resources;


                        $('#createStudyModal #studyStartTime').val(starttime);
                        $('#createStudyModal #studyEndTime').val(endtime);
                        $('#createStudyModal #studyStartDate').val(eventstartdate);
                        $('#createStudyModal #studyEndDate').val(eventenddate);
                        $('#createStudyModal #studyResourceID').val(resourcegroup);
                        //$('#createStudyModal #studyDescription').val(event.description);

                        $('#study-submitButton').prop('disabled',true);
                        $('#createStudyModal').modal('show');
                        //validation study name
                        $('#studyTitle').keyup(function () {
                            $('#study-submitButton').prop('disabled', this.value == "" ? true : false);
                        });


                        //default we don't wanna see repeat-freq options
                        document.getElementById('repeatFreqDivGroup').style.display = 'none';
                        //now if we click repeats we schould see hidden options
                        document.getElementById('repeatsGroup').onclick = function () {
                            // access properties using this keyword
                            if (this.checked) {
                                document.getElementById('repeatFreqDivGroup').style.display = 'block';
                            } else {
                                //if repeats not checked we reset values and hide
                                $('input[name="repeat-freq-group"]').prop('checked', false);
                                document.getElementById('repeatFreqDivGroup').style.display = 'none';
                            }


                        };


                        //fix for looping when add second third etc.. event
                        $('#study-submitButton').off('click');

                        //now when click submit on form
                        $('#study-submitButton').on('click', function (e) {
                            //we need title to print it on notification
                            var title = $('#createStudyModal #studyTitle').val();
                            //serialze form does not work as expected so need to send all values one more time
                            var starttime2 = $('#createStudyModal #studyStartTime').val();
                            var endtime2 = $('#createStudyModal #studyEndTime').val();
                            var eventstartdate2 =  $('#createStudyModal #studyStartDate').val();
                            var eventenddate2 = $('#createStudyModal #studyEndDate').val();
                            var resourcegroup2 =  $('#createStudyModal #studyResourceID').val();
                            var repeats = getRadioVal(document.getElementById("createStudyForm"),"repeat-freq-group");
                            var cancelrelatedevents = getRadioVal(document.getElementById("createStudyForm"),"cancelRelatedEvents");


                            if ( document.getElementById('repeatsGroup').checked == false)
                            {
                                repeats = 0;
                            }
                            //title became description because as ttle we use name of the kid
                            var description2 = "GRUPOWE: "+$('#createStudyModal #studyTitle').val();
                            // We don't want this to act as a link so cancel the link action
                            $("#createStudyModal").modal('hide');
                            //just before sending the form we switching resource name to resource ID
                            $('#createStudyModal #studyResourceID').val(resourceID);
                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin-oerw/add-study-group.php",
                                data:  "studyStartTime="+ starttime2 + "&studyEndTime=" + endtime2 + "&studyStartDate=" + eventstartdate2 + "&studyEndDate=" + eventenddate2 +
                                        "&category_id=" + category + "&groupName=" + resourcegroup + "&studyDescription=" + description2 + "&repeat_freq=" + repeats + "&cancelRelatedEvents=" + cancelrelatedevents,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send("Dodano nowe zajęcia grupowe dla grupy " + resourcegroup +" w dniu "+ eventstartdate +" o godz "+ starttime);

                                }

                            });

                        });

                    }

                }, {
                    label: 'Nieobecność',
                    cssClass: 'btn-warning',
                    action: function (dialogItself) {
                        dialogItself.close();
                        //this will give different color for event leave
                        var category = 4;

                        //stuff for form
                        $('#createLeaveModal').find('form')[0].reset();



                        //default we create event for all day
                        var leavestarttime = moment().set({'hour': 08, 'minute': 00, 'second': 00}).format('HH:mm');
                        var leaveendtime = moment().set({'hour': 15, 'minute': 00, 'second': 00}).format('HH:mm');
                        var leaveStartDate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var leaveEndDate = $.fullCalendar.moment(start).format('YYYY-MM-DD');
                        var leaveTitle =  $('#createLeaveModal #leaveTitle').val();
                        var leaveresourcename = getResourceName(resources);
                        var leaveresourceID = resources;
                        //put values to the form

                        $('#createLeaveModal #leaveStartDate').val(leaveStartDate);
                        $('#createLeaveModal #leaveEndDate').val(leaveEndDate);
                        //avoid set less date than start date on end date
                        $('#leaveEndDate').data("DateTimePicker").minDate(leaveStartDate);
                        $('#createLeaveModal #leaveStartTime').val(leavestarttime);
                        $('#createLeaveModal #leaveEndTime').val(leaveendtime);
                        //this will be our title for event to see it in correct place and only on kid plan.
                        $('#createLeaveModal #leaveResourceID').val(leaveresourcename);

                        $('#leaveSubmitButton').prop('disabled',true);
                        $('#createLeaveModal').modal('show');
                        $('#leaveTitle').keyup(function () {
                            $('#leaveSubmitButton').prop('disabled', this.value == "" ? true : false);
                        });

                        //fix for looping when add second third etc.. event
                        $('#leaveSubmitButton').off('click');
                        //now when click submit on form
                        $('#leaveSubmitButton').on('click', function (e) {

                            //leave modal form does not work with form serialize, so to have speed up things, decided to put each value manually
                            var leavestarttime2 =  $('#createLeaveModal #leaveStartTime').val();
                            var leaveendtime2 = $('#createLeaveModal #leaveEndTime').val();
                            var leavestartdate2 =  $('#createLeaveModal #leaveStartDate').val();
                            var leaveenddate2 = $('#createLeaveModal #leaveEndDate').val();
                            //this will go to as description, because we have to set first and last name of the kid in the title
                            var leaveTitle =  $('#createLeaveModal #leaveTitle').val();
                            var cancelrelatedinleave = getRadioVal(document.getElementById("LeaveAppointmentForm"),"cancelRelatedEventsforLeave");

                            //we need to set false resource id, becouse we don't want see leave for kids on teacher calendar.
                            //so if we set resource ID to ridiculus number then it does not show on teacher calendar
                            var falseResourceID= 10000;

                            // We don't want this to act as a link so cancel the link action
                            $("#createLeaveModal").modal('hide');

                            e.preventDefault();
                            $.ajax({
                                cache: false,
                                type: "POST",
                                url: "admin-oerw/add-leave-group.php",
                                data: "leaveTitle=" + leaveresourcename +"&leaveStartDate=" + leavestartdate2+"&leaveEndDate=" + leaveenddate2 +"&leaveStartTime=" + leavestarttime2 +"&leaveEndTime=" + leaveendtime2 +
                                      "&leaveResourceID=" + falseResourceID + "&category_id=" + category + "&description=NB: " + leaveTitle + "&canelrelatedEventsForLeave=" + cancelrelatedinleave,
                                success: function () {
                                    //alert();
                                    $('#calendar').fullCalendar('unselect');
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(leaveresourcename +" nieobecność w dniu "+ leavestartdate2);

                                }
                            });


                        });
                    }
                },
                    //this is labelled as cancel
                    {
                    label: 'Anuluj',
                    action: function (dialogItself) {
                        dialogItself.close();
                        $('#calendar').fullCalendar('unselect');

                    }
                }
            ]
    });
        //added cancel class to the "cancel buutons in any modals to unselect uncreated event"
        $('.cancel').off('click');
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
                var category = event.category_id;
                var checkrepeats = dailyorweekly(repeat_freq);
                 $('#edit-submitButton').prop('disabled', false);
                 $('#delete-submitButton').prop('disabled', false);
                //distinction between break, group events, leave and normal lesson
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
                                    url: "admin-oerw/process.php",
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
                                    url: "admin-oerw/process.php",
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
                                    url: "admin-oerw/process.php",
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
                //for child leave
                else if(category == 4)
                {
                    $('#leavepreviewEventModal #leavepreview-title').val(event.description);
                    $('#leavepreviewEventModal #leavepreview-event-date').val(eventdate);
                    $('#leavepreviewEventModal #leavepreview-start-time').val(starttime);
                    $('#leavepreviewEventModal #leavepreview-end-time').val(endtime);
                    $('#leavepreviewEventModal #leavepreview-resourceID').val(resourcename);
                    $('#leavepreviewEventModal #leavepreview-description').val(event.description);
                    $('#leavepreview-description').prop("readonly", true);
                    document.getElementById('leavepreviewDescriptionButtons').style.display = 'none';
                    $('#leavepreviewEventModal').modal('show');
                    /*****************************************description processing begin*************************************************/
                    $('#leavepreviewEventModal #leavepreview-description').focus(function (e) {
                        e.preventDefault();
                        $('#leavepreview-description').prop("readonly", false);
                        $('#leavedelete-submitButton').prop('disabled', true);
                        document.getElementById('leavepreviewDescriptionButtons').style.display = 'block';

                    });

                    $('#leavepreviewDescriptionButtonOK').off('click');
                    $('#leavepreviewDescriptionButtonOK').on('click', function () {
                        var description2json = $("#leavepreview-description").val();
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin-oerw/process.php",
                            data: 'type=updateDescription&event_id=' + event_id + '&description=' + description2json,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send("Dodano opis do nieobecności dla " + resourcename+" w dniu "+ eventdate +" o godz "+ starttime);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy dodawaniu opisu' + e.responseText);
                            }
                        });

                        $('#leavepreview-description').prop("readonly", true);
                        document.getElementById('leavepreviewDescriptionButtons').style.display = 'none';
                        $('#leavedelete-submitButton').prop('disabled', false);
                    });

                    $('#leavepreviewDescriptionButtonCancel').off('click');
                    $('#leavepreviewDescriptionButtonCancel').on('click', function () {
                        $('#leavepreviewEventModal #preview-description').val(event.description);
                        $('#leavepreview-description').prop("readonly", true);
                        document.getElementById('leavepreviewDescriptionButtons').style.display = 'none';

                        $('#leavedelete-submitButton').prop('disabled', false);

                    });


                    /*****************************************description processing end*************************************************/

                    $('#leavedelete-submitButton').off('click');

                    // if "delete button clicked" on sigle event deletion
                    $('#leavedelete-submitButton').on('click', function () {
                        var trimedDescription = $("#preview-description").val();
                        var description2json = trimedDescription.split('NB:')[0];
                        $('#leavepreviewEventModal').modal('hide');
                        BootstrapDialog.confirm({
                            type: BootstrapDialog.TYPE_DANGER,
                            closable: false,
                            title: 'Uwaga',
                            message: 'Czy napewno usunąć nieobecność?',
                            btnCancelLabel: 'Anuluj',
                            btnOKLabel: 'OK',
                            btnOKClass: 'btn-danger',
                            callback: function (result) {

                                if (result == true) {
                                    //variable to hold radio buttons values with options for deleting events
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin-oerw/process.php",
                                        data: 'type=delete-leave-for-kid&event_id=' + event_id + '&parent_id=' + parent_id + "&description=" + description2json + "&event_date=" + eventdate +
                                        "&starttime=" + starttime + "&endtime=" + endtime +'&resourcename=' + resourcename,
                                        success: function (response) {
                                            socket.send("Usunięto nieobecność dla " + resourcename + " o godzinie " + starttime);
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                        }
                                    })
                                }
                            }
                        })

                    })

                }

                else if (category ==7)
                {

                    //alert ("tu bedzie podgląd zajęć grupowych")
                    //put values to modal
                    var resourcegroup = getResourceGroup(resourceID);
                    $('#previewGroupEventModal #preview-title-group').val(resourcegroup);
                    $('#previewGroupEventModal #preview-groupevent-date').val(eventdate);
                    $('#previewGroupEventModal #previewgroup-start-time').val(starttime);
                    $('#previewGroupEventModal #previewgroup-end-time').val(endtime);
                    $('#previewGroupEventModal #previewgroup-description').val(event.description);

                    $('#previewGroupEventModal').modal('show');
                    document.getElementById('previewGroupDescriptionButtons').style.display = 'none';
                    $('#previewgroup-description').prop("readonly", true);
                    $('#previewGroupEventModal').modal('show');

                    /*****************************************description processing begin*************************************************/
                    $('#previewgroup-description').focus(function (e) {
                        e.preventDefault();
                        $('#previewgroup-description').prop("readonly", false);
                        $('#groupedit-submitButton').prop('disabled', true);
                        $('#groupdelete-submitButton').prop('disabled', true);
                        document.getElementById('previewGroupDescriptionButtons').style.display = 'block';

                    });

                    $('#previewGroupDescriptionButtonOK').off('click');
                    $('#previewGroupDescriptionButtonOK').on('click', function () {
                        var description2json = $("#previewgroup-description").val();
                        $.ajax({
                            cache: false,
                            type: "POST",
                            datatype: "json",
                            url: "admin-oerw/process-group.php",
                            data: 'type=updateDescription&parent_id=' + parent_id + '&description=' + description2json,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send("Dodano opis do zajęć grupowych  dla grupy " + resourcegroup +" o godz "+starttime);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy dodawaniu opisu' + e.responseText);
                            }
                        });

                        $('#previewgroup-description').prop("readonly", true);
                        document.getElementById('previewGroupDescriptionButtons').style.display = 'none';
                        $('#groupedit-submitButton').prop('disabled', false);
                        $('#groupdelete-submitButton').prop('disabled', false);
                    });

                    $('#previewGroupDescriptionButtonCancel').off('click');
                    $('#previewGroupDescriptionButtonCancel').on('click', function () {
                        $('#previewGroupEventModal #previewgroup-description').val(event.description);
                        $('#previewgroup-description').prop("readonly", true);
                        document.getElementById('previewGroupDescriptionButtons').style.display = 'none';
                        $('#groupedit-submitButton').prop('disabled', false);
                        $('#groupdelete-submitButton').prop('disabled', false);

                    });


                    /*****************************************description processing end*************************************************/


                    /*****************************************delete group events start*****************************************************/

                    var starttime2 = $('#previewGroupEventModal #previewgroup-start-time').val();
                    var endtime2 = $('#previewGroupEventModal #previewgroup-end-time').val();
                    var startDate2 = $('#previewGroupEventModal #preview-groupevent-date').val();
                    var groupName = $('#previewGroupEventModal #preview-title-group').val();
                    var trimedDescription = $("#previewgroup-description").val();
                    var description2json = "";
                        //fix for looping when add second third etc.. event
                    $('#groupdelete-submitButton').off('click');

                    // if "delete button clicked on prewiev modal"
                    $('#groupdelete-submitButton').on('click', function () {

                        $('#previewGroupEventModal').modal('hide');
                        //if there is a single event only
                        if (repeat_freq == 0) {

                            $('#groupdeleteSingleEventModal').modal('show');

                            //problem:: sometime checkbox for deletion all events from day does not work, it deletes only single event
                            //fix: set default value
                            $('input[id="groupdeleteChildEvent"]').prop('checked', true);
                            //fix for looping when add second third etc.. event
                            $('#groupdeleteSingle-submitButton').off('click');

                            // if "delete button clicked" on sigle event deletion
                            $('#groupdeleteSingle-submitButton').on('click', function () {

                                //variable to hold radio buttons values with options for deleting events
                                $('#groupdeleteSingleEventModal').modal('hide');
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin-oerw/process-group.php",
                                    data: 'type=delete-all-events&event_id=' + event_id + '&parent_id=' + parent_id +"&start_time=" +starttime2+"&end_time="+endtime2+ "&start_date="+startDate2+ "&group_name="+ groupName +"&description="+description2json,
                                    success: function (response) {
                                        socket.send("Usunięto grupowe zajęcia dla grupy " + resourcegroup + " o godzinie " + starttime);
                                        $('#calendar').fullCalendar('refetchEvents');
                                        //console.log(response);
                                    },
                                    error: function (e) {
                                        alert('Wystąpił następujący błąd przy usuwaniu zajęć' + e.responseText);
                                    }
                                })
                            })
                        }
                        //if there is repeation
                        else if (repeat_freq != 0) {
                            //get value of repeats
                            var checkrepeats = dailyorweekly(repeat_freq);
                            //put retrieved repeats value to label on form
                            $("label[for='checkRepeatsLabel']").html("<strong>" + checkrepeats + "</strong>");

                            $('#groupdeleteRepeateEventModal').modal('show');
                            //problem:: sometime checkbox for deletion all events from day does not work, it deletes only single event
                            //fix: set default value
                            $('input[id="deleteChildEventRepeate"]').prop('checked', true);

                            //fix for looping when add second third etc.. event
                            $('#groupdeleteRepeate-submitButton').off('click');

                            // if "delete button clicked" on sigle event deletion
                            $('#groupdeleteRepeate-submitButton').on('click', function () {


                                var deleteOptionRepeat = getRadioVal(document.getElementById('groupdeleteYesRepeats'), 'optionsRadioRepeate');
                                //console.log(deleteOptionRepeat);
                                if (deleteOptionRepeat == 'groupdeleteSingleRepeate') {
                                    //console.log(deleteOptionRepeat);
                                    $('#groupdeleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin-oerw/process-group.php",
                                        data: 'type=delete-child-event&event_id=' + event_id + '&parent_id=' + parent_id +"&start_time=" +starttime2+"&end_time="+endtime2+ "&start_date="+startDate2+ "&group_name="+ groupName +"&description="+description2json,
                                        success: function (response) {
                                            socket.send("Usunięto grupowe zajęcia dla grupy " + resourcegroup + " o godzinie " + starttime);
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
                                        },
                                        error: function (e) {
                                            alert('Wystąpił błąd przy usuwaniu zajęć');
                                        }
                                    })
                                }
                                else if (deleteOptionRepeat == 'groupDeleteAllRepeate') {
                                    $('#groupdeleteRepeateEventModal').modal('hide');
                                    $.ajax({
                                        cache: false,
                                        type: "POST",
                                        datatype: "json",
                                        url: "admin-oerw/process-group.php",
                                        data: 'type=delete-all-events-repeats&event_id=' + event_id + '&parent_id=' + parent_id +"&start_time=" +starttime2+"&end_time="+endtime2+ "&start_date="+startDate2+ "&group_name="+ groupName +"&description="+description2json,
                                        success: function (response) {
                                            socket.send("Usunięto wszystkie grupowe zajęcia dla grupy " + resourcegroup + " o godzinie " + starttime);
                                            $('#calendar').fullCalendar('refetchEvents');
                                            //console.log(response);
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
                                        url: "admin-oerw/process.php",
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

                    /*****************************************delete group events end*****************************************************/
                    /*****************************************modify group events start*****************************************************/

                    var editStartTime = $.fullCalendar.moment(event.start).format('HH:mm');
                    var editEndTime = $.fullCalendar.moment(event.end).format('HH:mm');
                    //modify button clicked
                    //fix for looping when add second third etc.. event
                    $('#groupedit-submitButton').off('click');
                    $('#groupedit-submitButton').on('click', function () {

                        $('#previewGroupEventModal').modal('hide');

                        //put values to modal
                        $('#groupeditEventModal #groupedit-title').val(resourcegroup);
                        $('#groupeditEventModal #groupedit-event-date').val(eventdate);
                        $('#groupeditEventModal #groupedit-start-time').val(starttime);
                        $('#groupeditEventModal #groupedit-end-time').val(endtime);
                        $('#groupeditEventModal #groupedit-resourceID').val(event.title);
                        $('#groupeditEventModal #groupedit-description').val(event.description);

                        var event_id = event.id;
                        var parent_id = event.parent_id;
                        var repeat_freq = event.repeat_freq;
                        var resourceID = event.resources;
                        var category_id = event.category_id;

                        $('#groupeditEventModal').modal('show');
                        $('#groupedit-confirm-submitButton').off('click');
                        $('#groupedit-confirm-submitButton').on('click', function() {
                            var editStartTime = $('#groupeditEventModal #groupedit-start-time').val();
                            var editEndTime = $('#groupeditEventModal #groupedit-end-time').val();
                            var description = event.description;
                            $('#groupeditEventModal').modal('hide');
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
                                                url: "admin-oerw/update-event-group.php",
                                                data: $('#groupeditAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id + "&group_name="+resourcegroup+ "&description=" +description,
                                                success: function (response) {
                                                    //$('#calendar').fullCalendar('refetchEvents');
                                                    //TODO: refetch does not work inside, why??
                                                    $('#calendar').fullCalendar('refetchEvents');
                                                    socket.send("Zmodyfikowano zajęcia dla grupy" + resourcegroup + " w dniu " + eventdate + " o godzinie " + starttime);
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
                                                url: "admin-oerw/update-event-group.php",
                                                //here is something wrong with description
                                                data: $('#groupeditAppointmentForm').serialize() + '&type=update-child-event' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-date=' + eventdate + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id + "&group_name="+resourcegroup+ "&description=" +description,
                                                success: function (response) {
                                                    $('#calendar').fullCalendar('refetchEvents');
                                                    socket.send("Zmodyfikowano zajęcia dla grupy " + resourcegroup + " w dniu " + eventdate + " o godzinie " + starttime);

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
                                                url: "admin-oerw/update-event-group.php",
                                                data: $('#editAppointmentForm').serialize() + '&type=update-all-events-repeate' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-date=' + eventdate + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id + "&group_name="+resourcegroup+ "&description=" +description,
                                                success: function (response) {
                                                    $('#calendar').fullCalendar('refetchEvents');
                                                    socket.send("Zmodyfikowano wszystkie zajęcia dla grupy " + resourcegroup + " o godzinie " + starttime);

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
                        })
                    });
                        /*****************************************modify group events end*****************************************************/

                    }










                else {

                    //put values to modal
                    $('#previewEventModal #preview-title').val(resourcename);
                    $('#previewEventModal #preview-event-date').val(eventdate);
                    $('#previewEventModal #preview-start-time').val(starttime);
                    $('#previewEventModal #preview-end-time').val(endtime);
                    $('#previewEventModal #preview-resourceID').val(event.title);
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


                        document.getElementById('cancelCancelSubmitButton').style.display = 'inline';
                        document.getElementById('cancelSubmitButton').style.display = 'none';
                       document.getElementById('additional-event').style.display = 'inline';
                        document.getElementById('edit-submitButton').style.display = 'none';

                    }
                    //if not cancelled then we can simply enable this button
                    else
                    {
                        document.getElementById('edit-submitButton').style.display = 'inline';
                        document.getElementById('cancelCancelSubmitButton').style.display = 'none';
                        document.getElementById('cancelSubmitButton').style.display = 'block';
                       document.getElementById('additional-event').style.display = 'none';


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
                            url: "admin-oerw/process.php",
                            data: 'type=updateDescription&event_id=' + event_id + '&description=' + description2json,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send(resourcename+" dodano opis do zajęć dla " + event.title +" w dniu "+ eventdate +" o godz "+ starttime);
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy dodawaniu opisu' + e.responseText);
                            }
                        });

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
                                        url: "admin-oerw/process.php",
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
                                        url: "admin-oerw/process.php",
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
                                        url: "admin-oerw/process.php",
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
                                        url: "admin-oerw/process.php",
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
                                        url: "admin-oerw/process.php",
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
                        $('#editEventModal #edit-title').val(resourcename);
                        $('#editEventModal #edit-event-date').val(eventdate);
                        $('#editEventModal #edit-start-time').val(starttime);
                        $('#editEventModal #edit-end-time').val(endtime);
                        $('#editEventModal #edit-resourceID').val(event.title);
                        $('#editEventModal #edit-description').val(event.description);

                        var event_id = event.id;
                        var parent_id = event.parent_id;
                        var repeat_freq = event.repeat_freq;
                        var resourceID = event.resources;
                        var category_id = event.category_id;

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

                        var teacherID = getTeacherId(event.title);
                        //just before sending the form we switching resource name to resource ID
                        $('#editEventModal #edit-resourceID').val(teacherID);
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
                            var editDescription = '';
                            $.ajax({
                                cache: false,
                                type: "POST",
                                datatype: "json",
                                url: "admin-oerw/update-event.php",
                                data: $('#editAppointmentForm').serialize() + '&type=cancel-event' + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&description=' + editDescription,
                                success: function (response) {
                                    $('#calendar').fullCalendar('refetchEvents');
                                    socket.send(event.title+ " zmodyfikowano zajęcia dla "+resourcename +" w dniu " +eventdate+" o godzinie " +starttime);

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
                                            url: "admin-oerw/update-event.php",
                                            data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                            success: function (response) {
                                                //$('#calendar').fullCalendar('refetchEvents');
                                                //TODO: refetch does not work inside, why??
                                                $('#calendar').fullCalendar('refetchEvents');
                                                socket.send(event.title+ " zmodyfikowano zajęcia dla " +resourcename+" w dniu " +eventdate+" o godzinie " +starttime);
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
                                            url: "admin-oerw/update-event.php",
                                            //here is something wrong with description
                                            data: $('#editAppointmentForm').serialize() + '&type=update-child-event' + '&event_id=' + event_id + '&repeat_freq=' + repeat_freq + '&category_id=' + category_id + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime,
                                            success: function (response) {
                                                $('#calendar').fullCalendar('refetchEvents');
                                                socket.send(event.title+ " zmodyfikowano zajęcia dla " +resourcename+" w dniu " +eventdate+" o godzinie " +starttime);

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
                                            url: "admin-oerw/update-event.php",
                                            data: $('#editAppointmentForm').serialize() + '&type=update-all-events' + '&event_id=' + event_id + '&parent_id=' + parent_id + '&repeat_freq=' + repeat_freq + '&edit-start-time=' + editStartTime + '&edit-end-time=' + editEndTime + '&category_id=' + category_id,
                                            success: function (response) {
                                                $('#calendar').fullCalendar('refetchEvents');
                                                socket.send(event.title+ " zmodyfikowano zajęcia dla " +resourcename+" w dniu " +eventdate+" o godzinie " +starttime);

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
                            //for group event we use only cancel single, if user wants t cancel all events need to use nieobecność
                            var cancelOption = "cancelSingle";//getRadioVal(document.getElementById('cancelAppointmentForm'), 'cancelOptions');
                            var category_id = 6;
                            var description2json = $("#cancelDescription").val();

                            if (cancelOption == "cancelSingle")
                            {
                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    datatype: "json",
                                    url: "admin-oerw/process.php",
                                    data: 'type=cancelEvent&event_id=' + event_id + '&description=NB:' + description2json + '&category_id=' +category_id,
                                    success: function (response) {
                                        //TODO: refetch does not work inside, why??
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(event.title+" odwołano zajęcia dla " +resourcename+" w dniu " +eventdate+" o godzinie " +starttime);
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
                                    url: "admin-oerw/process.php",
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

                    });
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
                            url: "admin-oerw/process.php",
                            data: 'type=cancelEvent&event_id=' + event_id + '&description=' + description2json + '&category_id=' +category_id,
                            success: function (response) {
                                //TODO: refetch does not work inside, why??
                                $('#calendar').fullCalendar('refetchEvents');
                                socket.send("Odwołane poprzednio zajęcia dla " +resourcename+" w dniu " +eventdate+" o godzinie " +starttime +" odbędą się");
                            },
                            error: function (e) {
                                alert('Wystąpił następujący błąd przy anulowaniu odwołania zajęć' + e.responseText);
                            }

                        });
                        $('#previewEventModal').modal('hide');
                    });

                    $('#additional-event').off('click');
                    $('#additional-event').on('click', function (e){
                        $('#previewEventModal').modal('hide');

                        var category = 1;
                        //reset form to the clear values
                        $('#createEventModal').find('form')[0].reset();
                        //human read start end and day

                      //  var resourcename = getResourceName(resources);
                        var resourceID = resources;
                        loadResources2(date);
                        $('#createEventModal #title').val(resourcename);
                        $('#createEventModal #event-date').val(eventdate);
                        $('#createEventModal #start-time').val(starttime);
                        $('#createEventModal #end-time').val(endtime);
                        $('#createEventModal #selectResource');

                        //we don't want show repeats on additionl events

                        $('#createEventModal').modal('show');
                        document.getElementById('repeatsdiv').style.display='none';
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

                        //fix for looping when add second third etc.. event
                        $('#submitButton').off('click');
                        //now when click submit on form
                        $('#submitButton').on('click', function (e) {
                            //we need title to print it on notification
                            var title = $('#createEventModal #title').val();
                            //there is problem with pass to php starttime and endtime from form,
                            //need to walkaround , so manually pass these two values to the PHP
                            var starttime2 = $('#createEventModal #start-time').val();
                            var endtime2 = $('#createEventModal #end-time').val();
                            var resourceID2 = $('#selectResource option:selected').val();
                            var resourceName = $('#selectResource').find('option:selected').text();
                            //compare dates to check if range is corrcet
                            if (!(moment(starttime2, 'HH:mm').isBefore(moment(endtime2, 'HH:mm')))) {
                                alert("nie no bez jaj, ustaw poprawnie czas rozpoczecia i zakoczenia zajeć");
                                $('#submitButton').prop('disabled', true);
                                e.preventDefault();
                            }
                            //if dates are correct do this
                            else {
                                e.preventDefault();
                                $("#createEventModal").modal('hide');
                                // enh. add category for overhours
                                //check if checkbox is checked
                                if (document.getElementById('overhours').checked == true) {

                                    category = 5;
                                }


                                $.ajax({
                                    cache: false,
                                    type: "POST",
                                    url: "admin-oerw/add-event.php",
                                    data: $('#createAppointmentForm').serialize() + "&category_id=" + category + "&start-time=" + starttime2 + "&end-time=" + endtime2 + "&resourceID=" + resourceID2,
                                    success: function () {

                                        $('#calendar').fullCalendar('unselect');
                                        $('#calendar').fullCalendar('refetchEvents');
                                        socket.send(resourceName + " dodano nowe zajęcia dla " + title + " w dniu " + eventdate + " o godz " + starttime);

                                    }
                                });
                            }
                        });
                    });
                }
            },

         //when drag and drop existing event
    eventDrop: function(event, delta, revertFunc, resources) {

        //$('#calendar').unbind('taphold');
            var starttime = $.fullCalendar.moment(event.start).format('HH:mm');
            var endtime = $.fullCalendar.moment(event.end).format('HH:mm');
        //var endtime = $.fullCalendar.moment(event.start).add(delta,'ms').format('HH:mm');
            var eventdate =  $.fullCalendar.moment(event.start).format('YYYY-MM-DD');
            var resourcename = getResourceName(event.resources);
            var resourceID = event.resources;
            $('#editEventModal #edit-title').val(resourcename);
            $('#editEventModal #edit-event-date').val(eventdate);
            $('#editEventModal #edit-start-time').val(starttime);
            $('#editEventModal #edit-end-time').val(endtime);
            $('#editEventModal #edit-resourceID').val(event.title);
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
                var editStartTime = $('#editEventModal #edit-start-time').val();
                var editEndTime = $('#editEventModal #edit-end-time').val();
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
                                    url: "admin-oerw/update-event.php",
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
                                $('#calendar').fullCalendar('rerenderEvents');
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
                                    url: "admin-oerw/update-event.php",
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
                                    url: "admin-oerw/update-event.php",
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
            $('#editEventModal #edit-title').val(resourcename);
            $('#editEventModal #edit-event-date').val(eventdate);
            $('#editEventModal #edit-start-time').val(starttime);
            $('#editEventModal #edit-end-time').val(endtime);
            $('#editEventModal #edit-resourceID').val(event.title);
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
                var editStartTime = $('#editEventModal #edit-start-time').val();
                var editEndTime = $('#editEventModal #edit-end-time').val();
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
                                    url: "admin-oerw/update-event.php",
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
                                    url: "admin-oerw/update-event.php",
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
                                    url: "admin-oerw/update-event.php",
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

        //detect if we allow to drag&drop events
        if (document.getElementById('editCalendar').checked == true) {

            $('#calendar').fullCalendar('getView').calendar.options.editable = true;
            element.off('taphold');
            element.addTouchAllEvents();

            /**************************************************************************************************************
             * highlight all events titile to blue with the same title when event is pressed longer.
             **************************************************************************************************************/
            myTaphold(element, event);

        }
        else {
            $('#calendar').fullCalendar('getView').calendar.options.editable = false;
            //element.addTouchAllEvents();
            element.on('taphold', function(e){

                //get day viewed
                var currentViewDate = $('#calendar').fullCalendar('getDate');
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
                    else {

                        events[i].textColor = ''
                    }
                }
                $('#calendar').fullCalendar("rerenderEvents");

            })
        }


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
        else if (event.repeat_freq != 0) {

            element.find('.fc-time').append(' <span class="glyphicon glyphicon-refresh"></span>');
        }

        //add description to events
        //for plan for groups title will be null so need to add description after fc-time which always exists
        if (event.title !=null){

            element.find('.fc-title').append("<br/> " + event.description);
        }
        else if (event.description == null){

            element.find('.fc-time').append('<br/>');
        }
        else{

            element.find('.fc-time').append('<br/><p style="font-size:1.1em">' + event.description);
        }
        //this  is fix for appearing custom border during selecting new event
        if (event.description == null) {

            element.css('border-color', '#FFFFFF');
        }

        //red border should appear only when event is created and it has description
        //"!= null" -- this does not work probably after adding new event there is empty text but not null
        else if (event.description != '') {
            element.css('border-color', '#ff000f');

        }

        //to have more readable events and see spaces between events in column wee add small margin to events
        $(element).css("margin-bottom", "2px");



    },

  });
        /**************************************************************************************************************
         * checking resources when today button clicked, this need to be after loading fullcalendar
         * explanation under link http://stackoverflow.com/questions/27193160/affecting-fullcalendar-today-button-fc-today-button
         *
         **************************************************************************************************************/

        $(".fc-today-button").click(function() {
            //sz
            //checkResources();
        });
    }, 1000);

    /*****************************************************************************************************************
     * Function taken from http://www.tech.theplayhub.com/long_press_in_javascript/
     * need to put it into eventRender callback.
     * @param elementum
     * @param event
     *****************************************************************************************************************/
    function myTaphold(elementum, event){

        var longpress = false;
        var startTime, endTime;

        elementum.on('mousedown touchstart', function () {
            startTime = new Date().getTime();
        });
        elementum.on('mouseup touchend', function () {
            endTime = new Date().getTime();
            longpress = (endTime - startTime < 150) ? false : true;
        });

        elementum.on('click', function () {
            if (longpress) {

                //get day viewed
                var currentViewDate = $('#calendar').fullCalendar('getDate');
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
                    else {

                        events[i].textColor = ''
                    }
                }
                $('#calendar').fullCalendar("rerenderEvents");
            }
        });
    }

       /*********************************************autocomplete for title start ***********************/

    $('#createEventModal #title').typeahead({
        source: function (query, process) {
            $.ajax({
                url: "admin-oerw/temp_autocomplete.php",
                type: 'POST',
                dataType: 'JSON',
                data: 'query=' + query,
                success: function (data) {
                    process(data);
                    //console.log(data);
                }
            });
        }
    });

    /**********************************************autocomplete for title end******************************************/

    /*****************************************************************************************************************
     * show option window
     *
     *****************************************************************************************************************/
    $('#optionsButton').off('click');
    $('#optionsButton').on('click', function () {

        $('#submitOptionButton').prop('disabled', true);
        $('#optionsEventModal').modal('show');
        $('input[type=checkbox]').change(function(){

            $('#submitOptionButton').prop('disabled', false);
        });
    });

    /*****************************************************************************************************************
     * drag & drop dynamically on/off
     * this functionality is in two parts, this is first
     * second located in callback eventRender
     *
     *****************************************************************************************************************/
    $('#submitOptionButton').off('click');
    $('#submitOptionButton').on('click', function (e) {
        e.preventDefault();


        if (document.getElementById('editCalendar').checked == true || document.getElementById('bigScreenCalendar').checked == true) {

            $('#calendar').fullCalendar('rerenderEvents');
        }
        else {

            $('#calendar').fullCalendar('rerenderEvents');
        }

        $('#optionsEventModal').modal('hide');
    });
    /****
    * Need to avoid turn on big screen on tablets
    *
    *****/
    $("#bigScreenCalendar").click(function () {
        if ($(this).is(':checked') && ( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))) {

            BootstrapDialog.alert({
                title: 'Uwaga',
                message: 'funkcja big screen tylko na kompach LENOVO :)',
                type: BootstrapDialog.TYPE_INFO, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
                closable: true, // <-- Default value is false
                draggable: true, // <-- Default value is false
                buttonLabel: 'Zamknij' // <-- Default value is 'OK',
            });

            $('#bigScreenCalendar').removeAttr('checked');
        }
    });


    /*********************************************************************************************************
    * fullscreen functionality:
    * single button to toggle fullscreen on off
    * works ONLY with Chrome
    *
    * ********************************************************************************************************/
    var goFS = document.getElementById("fsButton");

    goFS.addEventListener("click", function () {

        if (!document.webkitIsFullScreen) {

            var conf = confirm("Przełączyć na tryb pełnego ekranu?");
            var docelem = document.documentElement;

            if (conf == true) {
                if (document.getElementById('bigScreenCalendar').checked == true) {

                    $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
                }
                else {

                    $('#calendar').fullCalendar('option', 'aspectRatio', 2.05);
                }

                if (docelem.requestFullscreen) {

                    docelem.requestFullscreen();
                }
                else if (docelem.mozRequestFullScreen) {

                    docelem.mozRequestFullScreen();
                }
                else if (docelem.webkitRequestFullScreen) {

                    docelem.webkitRequestFullScreen();
                }
                else if (docelem.msRequestFullscreen) {

                    docelem.msRequestFullscreen();
                }
            }
        }
        else {
            $('#calendar').fullCalendar('option', 'aspectRatio', 2.35);
            if (document.exitFullscreen) {

                document.exitFullscreen();
            }
            else if (document.mozCancelFullScreen) {

                document.mozCancelFullScreen();
            }
            else if (document.webkitCancelFullScreen()) {

                document.webkitCancelFullScreen();
            }
        }
    }, false);
});

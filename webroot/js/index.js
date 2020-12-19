var STATUS = [
    {id: '', value: '' , name: ''},
    {id: 'open', value: 'Open' , name: 'open'},
    {id: 'assess', value: 'Assess' , name: 'assess'},
    {id: 'inProgress', value: 'In Progress' , name: 'inProgress'},
    {id: 'codeReview', value: 'Code Review' , name: 'codeReview'},
    {id: 'unitTesting', value: 'Unit Testing' , name: 'unitTesting'},
    {id: 'fixed', value: 'Fixed' , name: 'fixed'},
    {id: 'readyForQATesting', value: 'Ready For QA Testing' , name: 'readyForQATesting'},
    {id: 'qaTesting', value: 'Quality Assurance Testing' , name: 'qaTesting'},
    {id: 'qaCompleted', value: 'Quality Assurance Completed' , name: 'qaCompleted'},
    {id: 'userAcceptanceTesting', value: 'User Acceptance Testing' , name: 'userAcceptanceTesting'},
    {id: 'readyToRelease', value: 'Ready To Release' , name: 'readyToRelease'},
    {id: 'resolved', value: 'Resolved' , name: 'resolved'},
    {id: 'notReproducible', value: 'Not reproducible' , name: 'notReproducible'},
    {id: 'willFixLater', value: 'Will fix later' , name: 'willFixLater'},
    {id: 'wontfix', value: 'Will not fix' , name: 'wontfix'},
    {id: 'invalid', value: 'Invalid' , name: 'invalid'}
]

var PRIORITY = [
  {id: '', value: '' , name: ''},
  {id: 80, value: '80' , name: 'High'},
  {id: 50, value: '50' , name: 'Medium'},
  {id: 25, value: '25' , name: 'Low'},
  {id: 0,  value: '0' ,  name: 'Wishlist'},
  {id: 90, value: '90' , name: 'Needs Triage'}
]

function showLoading() {
    $('.jsgrid-load-shader').show();
    $('.jsgrid-load-panel').show();
}
function hideLoading() {
    $('.jsgrid-load-shader').hide();
    $('.jsgrid-load-panel').hide();
}

function showBulkEditArea() {
    $('#bulk-editor').show();
}
function hideBulkEditArea() {
    $('#bulk-editor').hide();
}
$(function() {
    var db = {
        loadData: function(filter) {
            return $.ajax({
                type: "GET",
                url: "tickets.json",
                data: filter
            }).then((data)=> {
                hideBulkEditArea()
                hideLoading()
                return data.returnData;
            });
        },

        insertItem: function(item) {
            return $.ajax({
                type: "POST",
                url: "tickets/add.json",
                data: item
            });
        },

        updateItem: function(item) {
            return $.ajax({
                type: "PUT",
                url: "tickets/edit.json",
                data: item
            });
        },

        deleteItem: function(item) {
            return $.ajax({
                type: "DELETE",
                url: "tickets/delete.json",
                data: item
            });
        }
    }
    var selectedItems = [];

    var selectItem = function(item) {
        selectedItems.push(item);
        if (selectedItems.length > 1) {
            showBulkEditArea()
        }
    };

    var selectAllItems = function(item) {
        let allData = $("#all-tickets").jsGrid("option", "data");
        let pageSize = $("#all-tickets").jsGrid("option", "pageSize");
        let pageIndex = $("#all-tickets").jsGrid("option", "pageIndex");
        selectedItems = allData.slice((pageIndex - 1) * pageSize, pageIndex * pageSize)
        $('input:checkbox').prop('checked', true)
        showBulkEditArea()
    };

    var unselectAllItems = function(item) {
        $('input:checkbox').prop('checked', false)
        selectedItems = []
        hideBulkEditArea()
    };

    var unselectItem = function(item) {
        selectedItems = $.grep(selectedItems, function(i) {
            return i !== item;
        });
        if (selectedItems.length > 1) {
            showBulkEditArea()
        }
    };

    var changeStatus = function(item, data, id, owner) {
        showLoading();
        var postData = {
            'tickets': [id],
            'status': data.name
        }

        if (owner) {
            postData['owner'] = owner;
        }

        $.ajax({
            type: "POST",
            url: "tickets/edit.json",
            data: postData
        }).then((responseData)=> {
            // console.log("succ", responseData);
            $(".conform-user-box").remove();
            $("#all-tickets").jsGrid("render");
        }).catch((error)=> {
            hideLoading(); 
        });
    }

    $('#bulkStatusUpdate').on('click', function() {
        showLoading();
        var postData = {
            'tickets': selectedItems.map(a => a.id),
            'status': $("#bulkStatus option:selected").val()
        }

        $.ajax({
            type: "POST",
            url: "tickets/edit.json",
            data: postData
        }).then((responseData)=> {
            // console.log("succ", responseData);
            $("#all-tickets").jsGrid("render");
        }).catch((error)=> {
            hideLoading(); 
        });
    });

    $('#bulkPrioUpdate').on('click', function() {
        showLoading();
        var postData = {
            'tickets': selectedItems.map(a => a.id),
            'priority': $("#bulkPrio option:selected").val()
        }

        $.ajax({
            type: "POST",
            url: "tickets/edit.json",
            data: postData
        }).then((responseData)=> {
            // console.log("succ", responseData);
            $("#all-tickets").jsGrid("render");
        }).catch((error)=> {
            hideLoading(); 
        });
    });

    $("#all-tickets").jsGrid({
        height: "calc( 100% - 50px)",
        width: "100%",

        filtering: true,
        editing: true,
        sorting: true,
        paging: true,
        autoload: true,

        pageSize: 10,
        paging: true,
        loadIndication: true,
        pageButtonCount: 5,

        controller: db,
        onPageChanged: function(args) {
            unselectAllItems()
        },
        rowClick: function(args) {
            // console.log("sdf", args);
        },
        rowRenderer: function(item) {
            //var $photo = $("<div>").addClass("client-photo").append($("<img>").attr("src", user.picture.large));
            var $checkbox = $("<td width='30'>").append($("<input style='margin-top:5px;'>").attr("type", "checkbox")
                    .prop("checked", $.inArray(item, selectedItems) > -1)
                    .on("change", function () {
                        $(this).is(":checked") ? selectItem(item) : unselectItem(item);
                    }));
            var $ticketDetail = $("<td colspan='3' width='300'>").append($("<a>").attr("class", "ticket-id")
                .attr('href', 'https://phab.zoomrx.com/T'+item.id)
                .attr('target',"_blank").html("T"+item.id),$("<span>").attr("class", "ticket-name").html(item.name),
                $("<span>").html(item.description)
                    .attr("class", item.description? "ticket-description" : "")
                    .on("click", function() {
                        $(this).attr("class", "ticket-description expanded");
                    }),
                );
            if (item.owner || (item.projects && item.projects.length)) {
                var blockele = $("<div class='ticket-associate'>");
                if (item.owner) {
                    blockele.append($("<span>").attr("class", "ticket-owner").append($('<i class="fa fa-user" aria-hidden="true">'),item.owner));
                    
                }
                if (item.projects.length) {
                    item.projects.forEach(function(obj) {
                        blockele.append($("<span>").attr('class', 'ticket-owner').append($('<i class="fa fa-briefcase" aria-hidden="true">'), obj.name));
                    })
                }
                $ticketDetail.append(blockele);
            }
            var statusValue = STATUS.find(function(state){
                      return state.id == item.status;
                    })
            var priorityValue = PRIORITY.find(function(priority){
                      return priority.id == item.priority;
                    })
            var $status = $("<td colspan='2' width='100'>").append($("<span>").attr("class", "ticket-status").html(statusValue && statusValue.value || "Unknown Status"),$("<span>").attr("class", "ticket-priority").html(priorityValue && priorityValue.name || ""));


            var action = [];
            switch(item.status) {
                
                case 'open':
                action = [{name: "assess", title: 'Assess',assign: true}];
                break;
                
                case 'assess':
                action = [{name: "inProgress", title: 'Start'}, {name: "invalid", title: 'Invalid'}, {name: "notReproducible", title: 'Not reproducible'}];
                break;
                
                case 'inProgress':
                action = [{name: "unitTesting", title: 'Unit testing'}, {name: "resolved", title: 'Resolved'}];
                break;
                
                case 'unitTesting':
                action = [{name: "codeReview", title: 'Code Review', assign: true}];
                break;
                
                case 'codeReview':
                action = [{name: "fixed", title: 'Verify'}, {name: "inProgress", title: 'Rework'}];
                break;
                
                case 'fixed':
                action = [{name: "readyForQATesting", title: 'Ready for QA testing', assign: true}];
                break;
                
                case 'readyForQATesting':
                action = [{name: "userAcceptanceTesting", title: 'Assing To Other QA', assign: true}, {name: "userAcceptanceTesting", title: 'Own it'}];
                break;
                
                case 'qaTesting':
                action = [{name: "inProgress", title: 'Failed'}, {name: "qaCompleted", title: 'Verified'}];
                break;
                
                case 'qaCompleted':
                action = [{name: "userAcceptanceTesting", title: 'User Acceptance Testing', assign: true}, {name: "readyToRelease", title: 'Verified'}];
                break;

                case 'userAcceptanceTesting':
                action = [{name: "qaTesting", title: 'Issue'}, {name: "readyToRelease", title: 'Verified'}];
                break;
                
                case 'readyToRelease':
                action = [{name: "resolved", title: 'Completed'}];
                break;
            }
            // console.log(action);
            var $actions = [];
            action.forEach(function(obj) {
                $actions.push($("<button>").attr('class', 'action-button').html(obj.title)
                    .on('click', function() {
                        if (obj.assign) {
                            var select = $("<select id='selUser'"+item.id+">").append($("<option value=''>").text('- Assign User -'));
                            var button = $("<button class='action-button'>").html('Assign').on("click", function() {
                                if (select.val()) {
                                    changeStatus(item,obj, item.id, select.val());
                                }
                            })
                            var cancelButton = $("<button class='action-button cancel-button'>").html('Cancel').on("click", function() {
                                $(this).parent().remove();
                            })
                            
                            $(this).after($("<div class='conform-user-box'>").append($("<div class='invisible-box'>"),select,button, cancelButton));
                            select.select2({
                                  ajax: { 
                                   url: "users/search-users",
                                   type: "GET",
                                   dataType: 'json',
                                   delay: 250,
                                   data: function (params) {
                                    return {
                                      'user_name': '"'+params.term+'"' // search term
                                    };
                                   },
                                   processResults: function (response) {
                                    // console.log(response.responseData);
                                    var users = [];
                                    response.responseData.forEach(function(user) {
                                        users.push({id:user.phid, text:user.name})
                                    })
                                     return {
                                        results: users
                                     };
                                   },
                                   cache: true
                                  }
                            })
                        } else {
                            changeStatus(item,obj, item.id);
                        }
                }));
            })
            
            var $editRow = $("<td width='100' style='position: relative;'>")
            if ($actions.length) {
                $editRow.append($actions);
            }

            $editRow.append($("<button>").attr('class','jsgrid-button jsgrid-edit-button').attr('title',"Edit")
                        .on("click", function() {
                            $("#all-tickets").jsGrid("editItem", item);
                        }));
            return $("<tr>").append($checkbox, $ticketDetail, $status, $editRow);
        },
        fields: [
            {
                headerTemplate: function() {
                    return $("<input>").attr("type", "checkbox").text("All")
                            .prop ("checked", $(this).prop('checked'))
                            .on("change", function () {
                                $(this).is(":checked") ? selectAllItems() : unselectAllItems();
                            });
                },
                itemTemplate: function(_, item) {
                    return 
                },
                align: "center",
                editing: false,
                width: 30

            },
            { name: 'id', title: "Id", type: "text", width: 30, editing: false, filtering: false},
            { name: 'name', title: 'Name', type: "text", width: 150 ,sorting: false, filtering: true},
            {name: 'description', title: 'Ticket Description', type: "text", width: 150, sorting: false, filtering:true},
            { name: 'status', title: 'Status',filtering:true, type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: STATUS, valueField: "id", textField: "value"
            },
            { width: 50, name: 'priority', title: 'Priority', filtering:true, type: "select",
                    itemTemplate: function(value, item) {
                        //console.log("asd", value, item);
                        return value;
                    },
                items: PRIORITY, valueField: "id", textField: "name" },

            { width: 100,type: "control", deleteButton: false}
        ]

    });
});

jsGrid.sortStrategies.STATUS = function(index1, index2) {
    var status1 = STATUS.findIndex(function(item){
                    return item.name == index1;
                    })
    var status2 = STATUS.findIndex(function(item){
                    return item.name == index2;
                  })
    return status1.localeCompare(status2);
};

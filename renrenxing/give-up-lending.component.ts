import { Component, OnInit, Inject } from '@angular/core';

@Component({
    selector: 'app-give-up-lending',
    templateUrl: './give-up-lending.component.html',
    styleUrls: ['./give-up-lending.component.scss']
})
export class GiveUpLendingComponent implements OnInit {
    list: any = [];
    pageNum: any;
    pages: any;
    isActive: any;
    selectedIndex = -1;
    searchObj = {
        applyStartTime: '',
        applyEndTime: '',
        pageNum: 1,
        refuseStartTime: '',
        refuseEndTime: '',
    };
    selectValue = {
        hasChoice: null
    };
    searchObjs = {
        use: 'borrower',
    };
    nameChoose = [
        {
            value: 'borrower',
            text: '借款人'
        },
        {
            value: 'processor',
            text: '申请人'
        },
        {
            value: 'loaner',
            text: '放款人'
        }
    ];
    isLoadingOne = false;
    constructor( @Inject('jdbBaseApi') private jdbBaseApi) { }

    ngOnInit() {
        this.getList();
    }

    tabRefresh() {
        let borrowerName = sessionStorage.getItem('borrowerName') || '';
        if(!(borrowerName === 'null')) this.selectValue.hasChoice = borrowerName;
    }

    //已拒绝数据请求
    getList(searchObj?: any) {
        let params = Object.assign({}, this.searchObj);
        let deft = this.searchObjs.use;
        params[deft] = this.selectValue.hasChoice;
        this.jdbBaseApi.post("getGiveUpListApi", params).subscribe(
            (res) => {
                this.list = res.data.list;
                this.pages = res.data.paginator;
            },
            (error) => {
                alert('获取登录地址失败！！！');
            }
            )
    }

    //分页
    onPageChange(msg) {
        this.searchObj.pageNum = msg;       
        this.getList();
    }
    
    //备注
    setEditStatus(item, event, index = -1){
        this.isActive = true;
        item.editStatus = true;
        this.selectedIndex = index;
    }
    
    blur(item){
        this.isActive = false;
        item.editStatus = false;
        this.jdbBaseApi.post('remarkLoanerApi',{
            content: item.remark,
            loanId: item.loanId,
            applyId: item.applyId
        }).subscribe(res=>{});
    }

    //查询
    search() {
        sessionStorage.setItem('borrowerName', this.selectValue.hasChoice);        
        this.isLoadingOne = true;
        this.getList(this.searchObj);
    }

    //重置
    reset() {
        this.searchObj = {
            applyStartTime: '',
            applyEndTime: '',
            pageNum: 1,
            refuseStartTime: '',
            refuseEndTime: '',
        };
        this.selectValue.hasChoice = null;
        this.searchObjs.use = 'borrower';
    }
}

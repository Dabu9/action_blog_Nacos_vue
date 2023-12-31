<template>
  <div id="table" class="app-container calendar-list-container">
    <!-- 查询和其他操作 -->
    <div class="filter-container" style="margin: 10px 0 10px 0;">
      <el-input v-model="keyword" clearable class="filter-item" style="width: 200px;" placeholder="请输入分类名称"/>
      <el-button v-permission="'/pictureSort/getList'" class="filter-item" type="primary" icon="el-icon-search" @click="handleFind">查找</el-button>
      <el-button v-permission="'/pictureSort/add'" class="filter-item" type="primary" icon="el-icon-edit" @click="handleAdd">添加</el-button>
    </div>

    <el-table :data="tableData" style="width: 100%">
      <el-table-column type="selection"/>

      <el-table-column label="序号" width="60" align="center">
        <template slot-scope="scope">
          <span >{{ scope.$index + 1 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="标题图" width="160" align="center">
        <template slot-scope="scope">
          <img v-if="scope.row.photoList" :src="scope.row.photoList[0]" style="width: 130px;height: 70px;">
        </template>
      </el-table-column>

      <el-table-column label="分类名" width="160" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.name }}</span>
        </template>
      </el-table-column>

      <el-table-column label="排序" width="100" align="center">
        <template slot-scope="scope">
          <el-tag type="warning">{{ scope.row.sort }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="图片选择器显示" width="150" align="center">
        <template slot-scope="scope">
          <el-tag v-for="item in yesNoDictList" v-if="scope.row.isShow == item.dictValue" :key="item.uid" :type="item.listClass">{{ item.dictLabel }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="160" align="center">
        <template slot-scope="scope">
          <span >{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="更新时间" width="160" align="center">
        <template slot-scope="scope">
          <span >{{ scope.row.updateTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" width="100" align="center">
        <template slot-scope="scope">
          <template v-if="scope.row.status == 1">
            <span>正常</span>
          </template>
          <template v-if="scope.row.status == 2">
            <span>推荐</span>
          </template>
          <template v-if="scope.row.status == 0">
            <span>已删除</span>
          </template>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" min-width="315">
        <template slot-scope="scope" >
          <el-button type="success" size="small" @click="handleManager(scope.row)">图片列表</el-button>
          <el-button v-permission="'/pictureSort/stick'" type="warning" size="small" @click="handleStick(scope.row)">置顶</el-button>
          <el-button v-permission="'/pictureSort/edit'" type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-permission="'/pictureSort/delete'" type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页-->
    <div class="block">
      <el-pagination
        :current-page.sync="currentPage"
        :page-size="pageSize"
        :total="total"
        layout="total, prev, pager, next, jumper"
        @current-change="handleCurrentChange"/>
    </div>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form ref="form" :model="form" :rules="rules">

        <el-form-item :label-width="formLabelWidth" label="封面">
          <div v-if="form.photoList" class="imgBody">
            <i v-show="icon" class="el-icon-error inputClass" @click="deletePhoto()" @mouseover="icon = true"/>
            <img :src="form.photoList[0]" style="display:inline; width: 195px;height: 105px;" @mouseover="icon = true" @mouseout="icon = false">
          </div>
          <div v-else class="uploadImgBody" @click="checkPhoto">
            <i class="el-icon-plus avatar-uploader-icon"/>
          </div>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="标题" prop="name">
          <el-input v-model="form.name" auto-complete="off"/>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="图片选择器显示" prop="isShow">
          <el-radio-group v-model="form.isShow" size="small">
            <el-radio v-for="item in yesNoDictList" :key="item.uid" :label="parseInt(item.dictValue)" border>{{ item.dictLabel }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label-width="formLabelWidth" label="排序" prop="sort">
          <el-input v-model="form.sort" auto-complete="off"/>
        </el-form-item>

        <el-form-item v-if="!isEditForm" :label-width="formLabelWidth" label="tip">
          <el-tag type="success">首次创建图片分类，可以先不设置封面，待到有图片时在设置即可</el-tag>
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取 消</el-button>
        <el-button type="primary" @click="submitForm">确 定</el-button>
      </div>
    </el-dialog>

    <CheckPhoto v-if="!isFirstPhotoVisible" :photo-visible="photoVisible" :photos="photoList" :files="fileIds" :limit="1" @choose_data="getChooseData" @cancelModel="cancelModel"/>

  </div>
</template>

<script>
import {
  getPictureSortList,
  addPictureSort,
  editPictureSort,
  deletePictureSort,
  stickPictureSort
} from '@/api/pictureSort'
import { getListByDictTypeList } from '@/api/sysDictData'
import CheckPhoto from '../../components/CheckPhoto'

export default {
  components: {
    CheckPhoto
  },
  data() {
    return {
      tableData: [],
      form: {
        uid: null,
        name: null,
        fileUid: null
      },
      loading: true,
      dialogVisible: false, // 控制增加框和修改框的显示
      currentPage: 1,
      total: null,
      pageSize: 10,
      keyword: '',
      title: '增加分类',
      formLabelWidth: '120px', // 弹框的label边框
      dialogFormVisible: false,
      isEditForm: false,
      photoVisible: false, // 控制图片选择器的显示
      photoList: [],
      yesNoDictList: [], // 是否字典
      fileIds: '',
      icon: false, // 控制删除图标的显示
      isFirstPhotoVisible: true, // 图片选择器是否首次显示【用于懒加载】
      rules: {
        name: [
          { required: true, message: '标题不能为空', trigger: 'blur' },
          { min: 1, max: 20, message: '长度在1到20个字符' }
        ],
        sort: [
          { required: true, message: '排序字段不能为空', trigger: 'blur' },
          { pattern: /^[0-9]\d*$/, message: '排序字段只能为自然数' }
        ]
      }
    }
  },
  created() {
    this.getDictList()
    this.pictureSortList()
  },
  methods: {
    pictureSortList: function() {
      var params = {}
      params.keyword = this.keyword
      params.pageSize = this.pageSize
      params.currentPage = this.currentPage
      getPictureSortList(params).then(response => {
        this.tableData = response.data.records
        this.currentPage = response.data.current
        this.pageSize = response.data.size
        this.total = response.data.total
      })
    },
    /**
     * 字典查询
     */
    getDictList: function() {
      var dictTypeList = ['sys_yes_no']
      getListByDictTypeList(dictTypeList).then(response => {
        if (response.code == this.$ECode.SUCCESS) {
          var dictMap = response.data
          this.yesNoDictList = dictMap.sys_yes_no.list
          if (dictMap.sys_yes_no.defaultValue) {
            this.yesNoDefault = parseInt(dictMap.sys_yes_no.defaultValue)
          }
        }
      })
    },
    handleFind: function() {
      this.currentPage = 1
      this.pictureSortList()
    },
    handleManager: function(row) {
      var uid = row.uid
      this.$router.push({
        path: 'picture',
        query: { pictureSortUid: uid }
      })
    },
    getFormObject: function() {
      var formObject = {
        uid: null,
        name: null,
        fileUid: null,
        sort: 0,
        isShow: this.yesNoDefault
      }
      return formObject
    },
    // 弹出选择图片框
    checkPhoto: function() {
      this.photoList = []
      this.fileIds = ''
      this.photoVisible = true
      this.isFirstPhotoVisible = false
    },
    getChooseData(data) {
      var that = this
      this.photoVisible = false
      this.photoList = data.photoList
      this.fileIds = data.fileIds
      var fileId = this.fileIds.replace(',', '')
      if (this.photoList.length >= 1) {
        this.form.fileUid = fileId
        this.form.photoList = this.photoList
      }
    },
    // 关闭模态框
    cancelModel() {
      this.photoVisible = false
    },
    deletePhoto: function() {
      this.form.photoList = null
      this.form.fileUid = ''
    },
    // 改变页码
    handleCurrentChange(val) {
      var that = this
      console.log(`当前页: ${val}`)
      // 改变当前所指向的页数
      this.currentPage = val
      this.pictureSortList()
    },
    // 点击新增
    handleAdd: function() {
      this.title = '增加分类'
      this.dialogFormVisible = true
      this.form = this.getFormObject()
      this.isEditForm = false
    },
    // 点击编辑
    handleEdit: function(row) {
      this.title = '编辑分类'
      this.dialogFormVisible = true
      this.isEditForm = true
      this.form = row
    },
    handleStick: function(row) {
      this.$confirm('此操作将会把该分类放到首位, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = row.uid
          stickPictureSort(params).then(response => {
            if (response.code == this.$ECode.SUCCESS) {
              this.pictureSortList()
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消置顶')
        })
    },
    handleDelete: function(row) {
      this.$confirm('此操作将会把分类下全部图片删除, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {}
          params.uid = row.uid
          deletePictureSort(params).then(response => {
            if (response.code == this.$ECode.SUCCESS) {
              this.$commonUtil.message.success(response.message)
            } else {
              this.$commonUtil.message.error(response.message)
            }
            this.pictureSortList()
          })
        })
        .catch(() => {
          this.$commonUtil.message.info('已取消删除')
        })
    },
    submitForm: function() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          console.log('校验出错')
        } else {
          if (this.isEditForm) {
            editPictureSort(this.form).then(response => {
              this.$commonUtil.message.success(response.message)
              this.dialogFormVisible = false
              this.pictureSortList()
            })
          } else {
            addPictureSort(this.form).then(response => {
              if (response.code == this.$ECode.SUCCESS) {
                this.$commonUtil.message.success(response.message)
              } else {
                this.$commonUtil.message.error(response.message)
              }
              this.dialogFormVisible = false
              this.pictureSortList()
            })
          }
        }
      })
    }
  }
}
</script>
<style scoped>
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  margin: 0, 0, 0, 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 195px;
  height: 105px;
  line-height: 105px;
  text-align: center;
}
.imgBody {
  width: 195px;
  height: 105px;
  border: solid 2px #ffffff;
  float: left;
  position: relative;
}
.uploadImgBody {
  margin-left: 5px;
  width: 195px;
  height: 105px;
  border: dashed 1px #c0c0c0;
  float: left;
  position: relative;
}
.uploadImgBody :hover {
  border: dashed 1px #00ccff;
}
.inputClass {
  position: absolute;
}
</style>

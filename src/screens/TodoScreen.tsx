import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MoodRayGlow } from '../components/MoodRayGlow';
import { useMood } from '../context/MoodContext';
import { LinearGradient } from 'expo-linear-gradient';
import { scale, responsiveStyle } from '../utils/responsive';

const { width } = Dimensions.get('window');

interface TodoSubtask {
  id: string;
  text: string;
  completed: boolean;
}

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  dueDate?: Date;
  category: 'feature' | 'bug' | 'improvement' | 'design' | 'personal' | 'work';
  tags: string[];
  subtasks: TodoSubtask[];
  notes?: string;
  estimatedTime?: number; // in minutes
}

const CATEGORIES = [
  { id: 'feature', label: 'Feature', color: '#00C853', icon: 'add-circle' },
  { id: 'bug', label: 'Bug', color: '#f44336', icon: 'bug' },
  { id: 'improvement', label: 'Improvement', color: '#2196f3', icon: 'trending-up' },
  { id: 'design', label: 'Design', color: '#9c27b0', icon: 'color-palette' },
  { id: 'personal', label: 'Personal', color: '#ff9800', icon: 'person' },
  { id: 'work', label: 'Work', color: '#607d8b', icon: 'briefcase' },
];

const PRIORITIES = [
  { id: 'low', label: 'Low', color: '#4caf50' },
  { id: 'medium', label: 'Medium', color: '#ff9800' },
  { id: 'high', label: 'High', color: '#f44336' },
];

const SORT_OPTIONS = [
  { id: 'createdAt', label: 'Date Created' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'priority', label: 'Priority' },
  { id: 'category', label: 'Category' },
  { id: 'alphabetical', label: 'Alphabetical' },
];

// Enhanced sample tasks with new features
const SAMPLE_TASKS: TodoItem[] = [
  {
    id: '1',
    text: 'Implement image upload functionality',
    completed: false,
    priority: 'high',
    createdAt: new Date(),
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    category: 'feature',
    tags: ['frontend', 'ui'],
    subtasks: [
      { id: 's1', text: 'Design upload interface', completed: true },
      { id: 's2', text: 'Implement file picker', completed: false },
      { id: 's3', text: 'Add progress indicator', completed: false },
    ],
    notes: 'Need to support multiple file formats',
    estimatedTime: 120,
  },
  {
    id: '2',
    text: 'Fix navigation error in FYP screen',
    completed: true,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    dueDate: new Date(Date.now() - 1000 * 60 * 60 * 1), // Past due
    category: 'bug',
    tags: ['navigation', 'hotfix'],
    subtasks: [],
    estimatedTime: 45,
  },
  {
    id: '3',
    text: 'Improve TODO screen UI design',
    completed: false,
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    category: 'design',
    tags: ['ui', 'enhancement'],
    subtasks: [
      { id: 's4', text: 'Add dark theme support', completed: false },
      { id: 's5', text: 'Improve animations', completed: false },
    ],
    estimatedTime: 180,
  },
  {
    id: '4',
    text: 'Add push notifications support',
    completed: false,
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6),
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    category: 'feature',
    tags: ['notifications', 'backend'],
    subtasks: [],
    estimatedTime: 240,
  },
  {
    id: '5',
    text: 'Plan weekend trip',
    completed: false,
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    category: 'personal',
    tags: ['travel', 'planning'],
    subtasks: [
      { id: 's6', text: 'Book hotel', completed: false },
      { id: 's7', text: 'Plan activities', completed: false },
      { id: 's8', text: 'Pack bags', completed: false },
    ],
    estimatedTime: 90,
  },
];

export const TodoScreen: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('feature');
  const [selectedPriority, setSelectedPriority] = useState('medium');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'overdue'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  
  // New enhancement states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [showFilters, setShowFilters] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoItem | null>(null);
  const [newTags, setNewTags] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newEstimatedTime, setNewEstimatedTime] = useState('');
  const [newDueDate, setNewDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const { detectMoodFromActivity } = useMood();

  useEffect(() => {
    loadTodos();
    // Detect mood based on todo activity
    detectMoodFromActivity('productive planning');
  }, []);

  const loadTodos = async () => {
    try {
      const storedTodos = await AsyncStorage.getItem('todos');
      if (storedTodos) {
        const parsedTodos = JSON.parse(storedTodos).map((todo: any) => ({
          ...todo,
          createdAt: new Date(todo.createdAt),
        }));
        setTodos(parsedTodos);
      } else {
        // Load sample tasks if no stored todos
        setTodos(SAMPLE_TASKS);
        await AsyncStorage.setItem('todos', JSON.stringify(SAMPLE_TASKS));
      }
    } catch (error) {
      console.error('Error loading todos:', error);
      // Fallback to sample tasks
      setTodos(SAMPLE_TASKS);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTodos = async (newTodos: TodoItem[]) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTodos));
    } catch (error) {
      console.error('Error saving todos:', error);
    }
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      detectMoodFromActivity('add task');
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        priority: selectedPriority as 'low' | 'medium' | 'high',
        createdAt: new Date(),
        category: selectedCategory as 'feature' | 'bug' | 'improvement' | 'design' | 'personal' | 'work',
        tags: [],
        subtasks: [],
      };

      const updatedTodos = [todo, ...todos];
      setTodos(updatedTodos);
      saveTodos(updatedTodos);
      setNewTodo('');
    }
  };

  const toggleTodo = (id: string) => {
    detectMoodFromActivity('complete task');
    const updatedTodos = todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const deleteTodo = (id: string) => {
    detectMoodFromActivity('delete task');
    Alert.alert(
      'Delete Todo',
      'Are you sure you want to delete this todo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updatedTodos = todos.filter(todo => todo.id !== id);
            setTodos(updatedTodos);
            saveTodos(updatedTodos);
          },
        },
      ]
    );
  };

  const markAllCompleted = () => {
    detectMoodFromActivity('complete all tasks');
    const updatedTodos = todos.map(todo => ({ ...todo, completed: true }));
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const clearCompleted = () => {
    detectMoodFromActivity('clear completed tasks');
    const updatedTodos = todos.filter(todo => !todo.completed);
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const getFilteredTodos = () => {
    let filteredTodos = todos;

    // Apply status filter
    switch (filter) {
      case 'active':
        filteredTodos = filteredTodos.filter(todo => !todo.completed);
        break;
      case 'completed':
        filteredTodos = filteredTodos.filter(todo => todo.completed);
        break;
      case 'overdue':
        filteredTodos = filteredTodos.filter(todo => 
          todo.dueDate && todo.dueDate < new Date() && !todo.completed
        );
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredTodos = filteredTodos.filter(todo =>
        todo.text.toLowerCase().includes(query) ||
        todo.tags.some(tag => tag.toLowerCase().includes(query)) ||
        todo.category.toLowerCase().includes(query) ||
        (todo.notes && todo.notes.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filteredTodos.sort((a, b) => {
      switch (sortBy) {
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case 'category':
          return a.category.localeCompare(b.category);
        case 'alphabetical':
          return a.text.localeCompare(b.text);
        default:
          return b.createdAt.getTime() - a.createdAt.getTime();
      }
    });

    return filteredTodos;
  };

  const getPriorityColor = (priority: string) => {
    const priorityItem = PRIORITIES.find(p => p.id === priority);
    return priorityItem?.color || '#65676b';
  };

  const getCategoryIcon = (category: string) => {
    const categoryItem = CATEGORIES.find(c => c.id === category);
    return categoryItem?.icon || 'document';
  };

  const getStats = () => {
    const total = todos.length;
    const completed = todos.filter(todo => todo.completed).length;
    const active = total - completed;
    const overdue = todos.filter(todo => 
      todo.dueDate && todo.dueDate < new Date() && !todo.completed
    ).length;
    return { total, completed, active, overdue };
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    if (diffDays <= 7) return `${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const getTaskProgress = (task: TodoItem) => {
    if (task.subtasks.length === 0) return task.completed ? 100 : 0;
    const completedSubtasks = task.subtasks.filter(st => st.completed).length;
    return Math.round((completedSubtasks / task.subtasks.length) * 100);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const updatedTodos = todos.map(todo => {
      if (todo.id === taskId) {
        return {
          ...todo,
          subtasks: todo.subtasks.map(st => 
            st.id === subtaskId ? { ...st, completed: !st.completed } : st
          )
        };
      }
      return todo;
    });
    setTodos(updatedTodos);
    saveTodos(updatedTodos);
  };

  const toggleTaskExpansion = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const stats = getStats();

  const renderTodoItem = ({ item }: { item: TodoItem }) => {
    const progress = getTaskProgress(item);
    const isOverdue = item.dueDate && item.dueDate < new Date() && !item.completed;
    const isExpanded = expandedTasks.has(item.id);
    
    return (
      <View style={[
        styles.todoItem, 
        item.completed && styles.todoItemCompleted,
        isOverdue && styles.todoItemOverdue
      ]}>
        <TouchableOpacity
          style={styles.todoCheckbox}
          onPress={() => toggleTodo(item.id)}
        >
          <Ionicons
            name={item.completed ? 'checkmark-circle' : 'ellipse-outline'}
            size={24}
            color={item.completed ? '#00C853' : isOverdue ? '#f44336' : '#65676b'}
          />
        </TouchableOpacity>
        
        <View style={styles.todoContent}>
          <Text style={[styles.todoText, item.completed && styles.todoTextCompleted]}>
            {item.text}
          </Text>
          
          {/* Progress bar for subtasks */}
          {item.subtasks.length > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${progress}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>
                {item.subtasks.filter(st => st.completed).length}/{item.subtasks.length}
              </Text>
            </View>
          )}
          
          {/* Tags */}
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {item.tags.length > 3 && (
                <Text style={styles.moreTagsText}>+{item.tags.length - 3}</Text>
              )}
            </View>
          )}
          
          <View style={styles.todoMeta}>
            <View style={styles.metaLeft}>
              <View style={styles.categoryContainer}>
                <Ionicons
                  name={getCategoryIcon(item.category) as any}
                  size={16}
                  color="#65676b"
                />
                <Text style={styles.categoryText}>
                  {CATEGORIES.find(c => c.id === item.category)?.label}
                </Text>
              </View>
              
              {item.dueDate && (
                <View style={[styles.dueDateContainer, isOverdue && styles.overdueDateContainer]}>
                  <Ionicons 
                    name="calendar-outline" 
                    size={14} 
                    color={isOverdue ? '#f44336' : '#65676b'} 
                  />
                  <Text style={[styles.dueDateText, isOverdue && styles.overdueDateText]}>
                    {formatDate(item.dueDate)}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.metaRight}>
              <View style={styles.priorityContainer}>
                <View
                  style={[
                    styles.priorityDot,
                    { backgroundColor: getPriorityColor(item.priority) },
                  ]}
                />
                <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                  {PRIORITIES.find(p => p.id === item.priority)?.label}
                </Text>
              </View>
              
              {item.estimatedTime && (
                <View style={styles.timeContainer}>
                  <Ionicons name="time-outline" size={14} color="#65676b" />
                  <Text style={styles.timeText}>{item.estimatedTime}m</Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.todoActions}>
          {item.subtasks.length > 0 && (
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => toggleTaskExpansion(item.id)}
            >
              <Ionicons 
                name={isExpanded ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#65676b" 
              />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              setEditingTask(item);
              setShowTaskModal(true);
            }}
          >
            <Ionicons name="create-outline" size={20} color="#2196f3" />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => deleteTodo(item.id)}
          >
            <Ionicons name="trash-outline" size={20} color="#f44336" />
          </TouchableOpacity>
        </View>
        
        {/* Expanded subtasks */}
        {isExpanded && item.subtasks.length > 0 && (
          <View style={styles.subtasksContainer}>
            {item.subtasks.map((subtask) => (
              <TouchableOpacity
                key={subtask.id}
                style={styles.subtaskItem}
                onPress={() => toggleSubtask(item.id, subtask.id)}
              >
                <Ionicons
                  name={subtask.completed ? 'checkmark-circle' : 'ellipse-outline'}
                  size={18}
                  color={subtask.completed ? '#00C853' : '#65676b'}
                />
                <Text style={[
                  styles.subtaskText,
                  subtask.completed && styles.subtaskTextCompleted
                ]}>
                  {subtask.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Notes preview */}
        {isExpanded && item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color="#00C853" />
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.wrapper}>
      <MoodRayGlow
        mood="productive"
        intensity={0.7}
        enabled={true}
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>TODO</Text>
              <Text style={styles.headerSubtitle}>Task Management</Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity 
                style={styles.themeToggle}
                onPress={() => setIsDarkTheme(!isDarkTheme)}
              >
                <Ionicons 
                  name={isDarkTheme ? 'sunny' : 'moon'} 
                  size={24} 
                  color={isDarkTheme ? '#ffd700' : '#65676b'} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.filterToggle}
                onPress={() => setShowFilters(!showFilters)}
              >
                <Ionicons name="options-outline" size={24} color="#65676b" />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#65676b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search tasks, tags, or notes..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#65676b" />
              </TouchableOpacity>
            )}
          </View>
          
          {/* Sort and Filter Options */}
          {showFilters && (
            <View style={styles.filtersContainer}>
              <Text style={styles.filtersTitle}>Sort by:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.sortButtons}>
                  {SORT_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.id}
                      style={[
                        styles.sortButton,
                        sortBy === option.id && styles.sortButtonActive
                      ]}
                      onPress={() => setSortBy(option.id)}
                    >
                      <Text style={[
                        styles.sortButtonText,
                        sortBy === option.id && styles.sortButtonTextActive
                      ]}>
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}
        </View>

        {/* Enhanced Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#00C853' }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#ff9800' }]}>{stats.active}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: '#f44336' }]}>{stats.overdue}</Text>
            <Text style={styles.statLabel}>Overdue</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {(['all', 'active', 'completed', 'overdue'] as const).map((filterType) => (
            <TouchableOpacity
              key={filterType}
              style={[
                styles.filterTab,
                filter === filterType && styles.filterTabActive,
              ]}
              onPress={() => setFilter(filterType)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  filter === filterType && styles.filterTabTextActive,
                ]}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bulk Actions */}
        <View style={styles.bulkActions}>
          <TouchableOpacity style={styles.bulkButton} onPress={markAllCompleted}>
            <Ionicons name="checkmark-done" size={16} color="#00C853" />
            <Text style={styles.bulkButtonText}>Mark All Complete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.bulkButton} onPress={clearCompleted}>
            <Ionicons name="trash" size={16} color="#f44336" />
            <Text style={styles.bulkButtonText}>Clear Completed</Text>
          </TouchableOpacity>
        </View>

        {/* Add Todo Section */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.addSection}
        >
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a new task..."
              value={newTodo}
              onChangeText={setNewTodo}
              onSubmitEditing={addTodo}
              returnKeyType="done"
            />
            <TouchableOpacity style={styles.addButton} onPress={addTodo}>
              <Ionicons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Category and Priority Selectors */}
          <View style={styles.selectorsContainer}>
            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Category:</Text>
              <View style={styles.selectorButtons}>
                {CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.selectorButton,
                      selectedCategory === category.id && styles.selectorButtonActive,
                      { borderColor: category.color },
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <Ionicons
                      name={category.icon as any}
                      size={16}
                      color={selectedCategory === category.id ? category.color : '#65676b'}
                    />
                    <Text
                      style={[
                        styles.selectorButtonText,
                        selectedCategory === category.id && { color: category.color },
                      ]}
                    >
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.selectorGroup}>
              <Text style={styles.selectorLabel}>Priority:</Text>
              <View style={styles.selectorButtons}>
                {PRIORITIES.map((priority) => (
                  <TouchableOpacity
                    key={priority.id}
                    style={[
                      styles.selectorButton,
                      selectedPriority === priority.id && styles.selectorButtonActive,
                      { borderColor: priority.color },
                    ]}
                    onPress={() => setSelectedPriority(priority.id)}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: priority.color },
                      ]}
                    />
                    <Text
                      style={[
                        styles.selectorButtonText,
                        selectedPriority === priority.id && { color: priority.color },
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Todo List */}
        <FlatList
          data={getFilteredTodos()}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item.id}
          style={styles.todoList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-done-circle" size={64} color="#e4e6eb" />
              <Text style={styles.emptyStateText}>
                {filter === 'completed' ? 'No completed tasks yet' : filter === 'overdue' ? 'No overdue tasks yet' : 'No tasks yet'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                Add a new task to get started!
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  container: responsiveStyle({
    flex: 1,
    backgroundColor: '#f8f9fa',
  }),
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#65676b',
    marginTop: 16,
  },
  header: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  headerTitle: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
  }),
  headerSubtitle: {
    fontSize: 14,
    color: '#65676b',
    marginTop: 4,
  },
  statsContainer: responsiveStyle({
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  statItem: responsiveStyle({
    flex: 1,
    alignItems: 'center',
  }),
  statNumber: responsiveStyle({
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1c1e21',
  }),
  statLabel: responsiveStyle({
    fontSize: 12,
    color: '#65676b',
    marginTop: 4,
  }),
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  filterTabActive: {
    backgroundColor: '#e3f2fd',
  },
  filterTabText: {
    fontSize: 14,
    color: '#65676b',
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#1877f2',
    fontWeight: '600',
  },
  bulkActions: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
    gap: 8,
  },
  bulkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 16,
    gap: 4,
  },
  bulkButtonText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  addSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  },
  inputContainer: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e4e6eb',
  }),
  input: responsiveStyle({
    flex: 1,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginRight: 8,
  }),
  addButton: responsiveStyle({
    backgroundColor: '#00C853',
    borderRadius: 20,
    padding: 12,
    marginLeft: 12,
  }),
  selectorsContainer: {
    gap: 12,
  },
  selectorGroup: {
    gap: 8,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
  },
  selectorButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    borderRadius: 16,
    gap: 4,
  },
  selectorButtonActive: {
    backgroundColor: '#f0f8ff',
  },
  selectorButtonText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  todoList: {
    flex: 1,
    padding: 16,
  },
  todoItem: responsiveStyle({
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  }),
  todoItemCompleted: {
    backgroundColor: '#f8f9fa',
    opacity: 0.6,
  },
  todoCheckbox: responsiveStyle({
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e4e6eb',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  todoContent: responsiveStyle({
    flex: 1,
  }),
  todoText: responsiveStyle({
    fontSize: 16,
    color: '#1c1e21',
    lineHeight: 22,
  }),
  todoTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#65676b',
  },
  deleteButton: {
    padding: 4,
  },
  todoMeta: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  }),
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#65676b',
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: '#65676b',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#65676b',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#65676b',
    marginTop: 8,
  },
  // New Enhanced Styles
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
  },
  filterToggle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1c1e21',
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c1e21',
    marginBottom: 8,
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    backgroundColor: '#fff',
  },
  sortButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#1877f2',
  },
  sortButtonText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: '#1877f2',
    fontWeight: '600',
  },
  todoItemOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e4e6eb',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00C853',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#65676b',
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#1877f2',
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 11,
    color: '#65676b',
    fontStyle: 'italic',
  },
  metaLeft: {
    flex: 1,
  },
  metaRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  overdueDateContainer: {
    backgroundColor: '#ffebee',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dueDateText: {
    fontSize: 12,
    color: '#65676b',
  },
  overdueDateText: {
    color: '#f44336',
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#65676b',
  },
  todoActions: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  }),
  expandButton: {
    padding: 4,
  },
  editButton: {
    padding: 4,
  },
  subtasksContainer: responsiveStyle({
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e4e6eb',
  }),
  subtaskItem: responsiveStyle({
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  }),
  subtaskCheckbox: responsiveStyle({
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e6eb',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  }),
  subtaskText: responsiveStyle({
    fontSize: 14,
    color: '#1c1e21',
  }),
  subtaskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#65676b',
  },
  notesContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e4e6eb',
  },
  notesText: {
    fontSize: 14,
    color: '#65676b',
    fontStyle: 'italic',
  },
}); 